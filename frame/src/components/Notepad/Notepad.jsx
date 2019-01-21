'use strict';
import config from '../../data/config.json';

import React, { Component } from "react";
import PropTypes from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select
  } from 'antd';

import ReactQuill from 'react-quill'; // This editor's the best one i found for now

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';
import localforage from 'localforage';

// import 'react-quill/dist/quill.snow.css';
import '../../assets/css/quill.snow.css';

import getTimestamp from '../../utils/get-timestamp';
/**
 *  JS NLP stuff (we make these calls in the Notebook component,
 *  so analysis can be done seamlessly with saving inside the editor.
 *  The Analyzer component will render the results that are created
 *  in Notepad.
*/
const sumBasic = require('node-sumbasic'); // Extractive summarizer
const franc = require('franc'); // Language detection

/** Data library / source vars */
const savedSettings = config.savedSettings;
const pythonNLPServer = config.savedSettings.NLPServer;
const defaultFLib = savedSettings.defaultLibrary;

import {
  normalizeText,
  filterCommonWords,
  getWordFrequency,
  parseTextForPeople,
  parseTextForPlaces,
  parseTextForDates,
  parseTextForOrganizations,
  parseTextForPhoneNumbers,
  parseTextForHashtags,
  parseTextForQuestions,
  parseTextForQuotes,
  parseTextForTopics,
  parseTextForStatements,
  parseTextForURLs,
  parseTextForTerms,
  parseTextForBigrams,
  parseTextForTrigrams,
  countChars,
  countSyllables,
  countWords,
  countSentences,
  countTotalSyllables,
  fleschReadability,
  getFleschReadability,
  splitSentences,
  summarizeParagraphs
  }
  from '../../lib/node-nlp-service';
 

// Local style
import './Notepad.scss';
import { getHTMLFromContent, getContentFromHTML, HTMLToText } from "../../utils/translate-html";

const Option = Select.Option;

const CustomStarButton = () => <span className="octicon octicon-star" />;


/** Notebook editors types */
const editorTypes = Object.freeze(
  {
    FLOW: "flow", // Dante Editor
    FULL: "full", // Quilljs (react-quill-js)
    CODE: "code", // Monaco Editor (VS Studio base)
    EQUATION: "equation" // Unknown? But needs to 
                         // include interactive calculator
  });

// Main notebook comp (handles editor switching)
export default class Notepad extends Component {

  constructor(props) {

    super(props);

    this.state = {
      editorHtml: '',
      // theme: 'snow',
      editorEnabled: true,
      placeholder: 'Write here...',
      _isMounted: false,
      editorType: "flow",
      // Keep track of the last known entry / editor in state to reduce
      // unnecessary rendering
      prevEditorState: {},
      prevEntryId: ""
    };

    this.handleEditorSwitchClick = this.handleEditorSwitchClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getEntries = this.getEntries.bind(this);
    // Save content in Notebook comp to db
    this.saveNotebookData = this.saveNotebookData.bind(this);
  }

  async getEntries(key) {
    let Entries = [];
    Entries = await getFromDB(key);
    return Entries;
  }

  handleChange (html) {
  	this.setState({ editorHtml: html });
  }
  
  handleThemeChange (newTheme) {
    if (newTheme === "core") newTheme = null;
    this.setState({ theme: newTheme })
  }
  
  componentDidMount() {
    const entryIdProp = this.props.entryId;
    const EntriesProp = this.props.Entries;
    const entryProp = this.props.entry;
    // this.refs.editor.focus();
    try {
      this.setState({_isMounted: true, entryId: entryIdProp,
        Entries: EntriesProp, entry: entryProp,
        prevEntryId: entryIdProp, editorHtml: entryProp['html'] || ''
      });
    } catch (err) {
      console.log("Notebook mount err: ", err);
      this.setState({_isMounted: true, entryId: entryIdProp,
                    Entries: EntriesProp, entry: entryProp, prevEntryId: entryIdProp,
                    editorHtml: ''
      });
    }
  }

  componentWillUnmount() {
    this.setState({_isMounted: false});
  }

  async componentWillReceiveProps(nextProps) {
    const _this = this;
    if (this.state._isMounted) {
      const nextEntryId = nextProps.entryId;    
      const needAnalysisUpdate = getState("needAnalysisUpdate");
      if (!needAnalysisUpdate) {
        if (nextEntryId === this.state.prevEntryId) {
          return;
        }  
      }
      const nextEntry = nextProps.entry;
      const nextEntries = nextProps.Entries;
      const library = defaultFLib;
      const Library = openDB(library);
      let editorType;

      let Entries = nextEntries;
      let entry = nextEntry;
      let entryId = nextEntryId;

      try { 
        editorType = entry.editorType;
      } catch (err) {
        editorType = "flow";
        setState("editorType", "flow");
      }

      const showAnalysisOverlay = nextProps.showAnalysisOverlay;
  
      if (entry['html'] !== null && entry['html'] !== undefined && entry['html'] !== ""
        && entry['html'] !== "undefined"
      ) {
        if (showAnalysisOverlay) {
          const strippedText = HTMLToText(entry['html']);
          entry['strippedText'] = strippedText;
          const combinedText = entry['title'] + ' ' + strippedText;
          const detectedLanguages = franc.all(combinedText).slice(0, 5);
          entry['detectedLanguages'] = detectedLanguages;
          entry['entities'] = {
            terms: parseTextForTerms(strippedText),
            topics: parseTextForTopics(strippedText),
            people: parseTextForPeople(strippedText),
            dates: parseTextForDates(strippedText),
            organizations: parseTextForOrganizations(strippedText),
            places: parseTextForPlaces(strippedText),
            phoneNumbers: parseTextForPhoneNumbers(strippedText),
            urls: parseTextForURLs(strippedText),
            hashtags: parseTextForHashtags(strippedText),
            quotes: parseTextForQuotes(strippedText),
            statements: parseTextForStatements(strippedText),
            questions: parseTextForQuestions(strippedText),
            bigrams: parseTextForBigrams(strippedText),
            trigrams: parseTextForTrigrams(strippedText)
          };
          entry['editorType'] = editorType;
          // Get text stats
          const charCount = countChars(strippedText);
          const syllableCount = countTotalSyllables(strippedText);
          const wordCount = countWords(strippedText);
          const sentenceCount = countSentences(strippedText);
          const avgWordsPerSentence = parseFloat(((wordCount / sentenceCount).toFixed(2)));
          const avgSyllablesPerSentence = parseFloat(((syllableCount / sentenceCount).toFixed(2)));
          const avgSyllablesPerWord = parseFloat(((syllableCount / wordCount).toFixed(2)));
          const fleschReadability = parseFloat((getFleschReadability(syllableCount, wordCount, sentenceCount).toFixed(2)));
          let summaryExtractive;
          let summaryByParagraphs;
          let summaryAbstractive;
          let summaryAbstractiveByParagraphs;
          let sentencesSplit = [];
          const docs = [];
          if (sentenceCount > 0) {
            sentencesSplit = splitSentences(strippedText);
            sentencesSplit.forEach(function(el) {
              const strLength = el.length;
              try {
                if (el[strLength-1].match(/^[.,:!?]/)) {
                  docs.push(el);
                } else {
                  const newEl = el.concat('.\r\n');
                  docs.push(newEl);
                }
              } catch (err) {
              }
            });
          }
          entry['stats'] = {
            charCount: charCount,
            syllableCount: syllableCount,
            wordCount: wordCount,
            sentenceCount: sentenceCount,
            avgWordsPerSentence: avgWordsPerSentence,
            avgSyllablesPerSentence: avgSyllablesPerSentence,
            avgSyllablesPerWord: avgSyllablesPerWord,
            fleschReadability: fleschReadability
          };
          entry['wordFrequency'] = getWordFrequency(strippedText);
          // if (sentenceCount > 1) {
          try {
            summaryExtractive = sumBasic(docs, parseInt(wordCount / 5), parseInt(sentenceCount / 5)).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
            summaryByParagraphs = summarizeParagraphs(docs.join(""));
          } catch (err) {
            // console.log(err);
            summaryExtractive = '';
            summaryByParagraphs = [];
          }
          try {
            fetch("http://localhost:80/api/abstractive_summarize", {
              method: "POST",
              mode: 'cors',
              body: JSON.stringify(strippedText),
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              },
              credentials: "same-origin"
              }).then(function(response) {
                return response.json()
              })
              .then(function(jsonRes) {
                summaryAbstractive = jsonRes['summarize_result'].join(" ");
                fetch("http://localhost:80/api/abstractive_summarize_paragraphs", {
                  method: "POST",
                  mode: 'cors',
                  body: JSON.stringify(strippedText.split(/\n/g)),
                  headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                  },
                  credentials: "same-origin"
                  }).then(function(response) {
                    return response.json()
                  })
                  .then(function(jsonRes) {
                    let summaries = [];
                    for (let i=0; i<jsonRes.length; i++) {
                      let ps = (jsonRes[i]['summarize_result'].join(" "));
                      if (ps !== "" && ps.length !== 0) {
                        summaries.push(ps);
                      }
                    }
                    entry['summaryExtractive'] = summaryExtractive;
                    entry['summaryByParagraphs'] = summaryByParagraphs;
                    entry['summaryAbstractive'] = summaryAbstractive;
                    entry['summaryAbstractiveByParagraphs'] = summaries;
                    const newEntries = replaceEntry(entry, Entries);
                    // const res = getContentFromHTML(entry['html']);
                    const html = entry['html'];
                    _this.setState({Entries: newEntries, editorHtml: html,
                    editorType: editorType});
                  })
                .catch(err => {
                  summaryAbstractive = '';
                  summaryAbstractiveByParagraphs = [];
                  entry['summaryExtractive'] = summaryExtractive;
                  entry['summaryByParagraphs'] = summaryByParagraphs;
                  entry['summaryAbstractive'] = summaryAbstractive;
                  entry['summaryAbstractiveByParagraphs'] = [];
                  const newEntries = replaceEntry(entry, Entries);
                  const html = entry['html'];
                  _this.setState({Entries: newEntries, editorHtml: html,
                  editorType: editorType});
                  message.error(err);
                });
              })
            .catch(err => {
              summaryAbstractive = '';
              summaryAbstractiveByParagraphs = [];
              entry['summaryExtractive'] = summaryExtractive;
              entry['summaryByParagraphs'] = summaryByParagraphs;
              entry['summaryAbstractive'] = summaryAbstractive;
              entry['summaryAbstractiveByParagraphs'] = [];
              const newEntries = replaceEntry(entry, Entries);
              // const res = getContentFromHTML(entry['html']);
              const html = entry['html'];
              // console.log(err);
              message.error(err);
              _this.setState({Entries: newEntries,  editorHtml: html,
              editorType: editorType});
            });
          } catch (err) {
            summaryAbstractive = '';
            summaryAbstractiveByParagraphs = [];
            summaryAbstractive = '';
            summaryAbstractiveByParagraphs = [];
            entry['summaryExtractive'] = summaryExtractive;
            entry['summaryByParagraphs'] = summaryByParagraphs;
            entry['summaryAbstractive'] = summaryAbstractive;
            entry['summaryAbstractiveByParagraphs'] = summaries;
            // console.log(err);
            message.error(err);
          }
        }
        const newEntries = replaceEntry(entry, Entries);
        // const res = getContentFromHTML(entry['html']);
        const html = entry['html'];
        _this.setState({Entries: newEntries, editorHtml: html,
        editorType: editorType, prevEntryId: entryId});
      } else {
        _this.setState({ editorHtml: ''
        });
      }
    }
  }
  

  /**
   * Handles the dropdown select menu to switch editor modes.
   * *this.state.editorType* is passed to Notepad props.
   *
   * @event {event} object
   * @public
   */
  handleEditorSwitchClick = async (event) => {
    setState("editorType", event.key.toString());
    // const library = getState("library");
    const library = defaultFLib;
    const Library = openDB(library);
    // const entryId = getState("entryId");
    const entryId = this.state.entryId;
    const entry = this.state.entry;
    // let Entries = [];
    // await getFromDB(Library, key).then(function(result) {
    //   Entries = result;
    // }).catch(function(err) {
    //   Entries = [];
    // });
    // Entries = getFromDB(Library,"entries")
    // const entry = traverseEntriesById(entryId, Entries);
    // if (entry['html'] === null || entry['html'] === undefined || entry['html'] === '') {
    //   this.setState({Entries: Entries, editorType: editorType, editorState: EditorState.createEmpty(), entryId: nextProps.entryId});
    // }


  /**
   * Build menu container to hold global buttons and selects.
   * @public
   */
  buildEditorSwitchMenu = (
    <Menu onClick={this.handleEditorSwitchClick} >
      <Menu.Item key="flow">
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Streamlined, Medium-style editor (default type); currently, only adding images \
                  from a local file works"}>
          <Icon type="edit"/>&nbsp;
            {editorTypes.FLOW.charAt(0).toUpperCase() +
            editorTypes.FLOW.slice(1)}
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="full" disabled>
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Full HTML editor with word processor-like capabilities; currently, only \
                  adding images from an online source works"}>
        <Icon type="form"/>&nbsp;
          {editorTypes.FULL.charAt(0).toUpperCase() +
          editorTypes.FULL.slice(1)}
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="code" disabled>
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Code editor and IDE (powered by Monaco Editor)"}>
          <Icon type="appstore"/>&nbsp;
          {editorTypes.CODE.charAt(0).toUpperCase() +
            editorTypes.CODE.slice(1)}
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="equation" disabled>
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Editor with equations and mathematical computations"}>
          <Icon type="calculator"/>&nbsp;
            {editorTypes.EQUATION.charAt(0).toUpperCase() +
            editorTypes.EQUATION.slice(1)}
        </Tooltip>
      </Menu.Item>    
    </Menu>
  );


  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveNotebookData() {
    let entry = this.state.entry;
    const timestampNow = getTimestamp();
    const entryId = this.state.entryId;
    const Entries = this.state.Entries;
    let editorType = entry['editorType'];
    // let library = getState("library");
    let library = defaultFLib;
    const Library = openDB(library);
    const m_this = this;
    entry['timestampLastModified'] = timestampNow;
    // if (entry !== null && entry !== undefined) {
      // entry['html'] = getHTMLFromContent(this.state.editorState);
      entry['html'] = this.state.editorHtml;
      console.log(entry['html']);
      const strippedText = HTMLToText(entry['html']);
      entry['strippedText'] = strippedText;
      const combinedText = entry['title'] + ' ' + strippedText;
      const detectedLanguages = franc.all(combinedText).slice(0, 5);
      entry['detectedLanguages'] = detectedLanguages;
      entry['entities'] = {
        terms: parseTextForTerms(strippedText),
        topics: parseTextForTopics(strippedText),
        people: parseTextForPeople(strippedText),
        dates: parseTextForDates(strippedText),
        organizations: parseTextForOrganizations(strippedText),
        places: parseTextForPlaces(strippedText),
        phoneNumbers: parseTextForPhoneNumbers(strippedText),
        urls: parseTextForURLs(strippedText),
        hashtags: parseTextForHashtags(strippedText),
        quotes: parseTextForQuotes(strippedText),
        statements: parseTextForStatements(strippedText),
        questions: parseTextForQuestions(strippedText),
        bigrams: parseTextForBigrams(strippedText),
        trigrams: parseTextForTrigrams(strippedText)
      };
      entry['editorType'] = editorType;
      // Get text stats
      const charCount = countChars(strippedText);
      const syllableCount = countTotalSyllables(strippedText);
      const wordCount = countWords(strippedText);
      const sentenceCount = countSentences(strippedText);
      const avgWordsPerSentence = parseFloat(((wordCount / sentenceCount).toFixed(2)));
      const avgSyllablesPerSentence = parseFloat(((syllableCount / sentenceCount).toFixed(2)));
      const avgSyllablesPerWord = parseFloat(((syllableCount / wordCount).toFixed(2)));
      const fleschReadability = parseFloat((getFleschReadability(syllableCount, wordCount, sentenceCount).toFixed(2)));
      let summaryExtractive;
      let summaryByParagraphs;
      let summaryAbstractive;
      let summaryAbstractiveByParagraphs;
      let sentencesSplit = [];
      const docs = [];
      if (sentenceCount > 0) {
        sentencesSplit = splitSentences(strippedText);
        sentencesSplit.forEach(function(el) {
          const strLength = el.length;
          try {
            if (el[strLength-1].match(/^[.,:!?]/)) {
              docs.push(el);
            } else {
              const newEl = el.concat('.\r\n');
              docs.push(newEl);
            }
          } catch (err) {
          }
        });
      }
      if (sentenceCount > 1) {
        try {
          summaryExtractive = sumBasic(docs, parseInt(wordCount / 5), parseInt(sentenceCount / 5)).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
          summaryByParagraphs = summarizeParagraphs(docs.join(""));
        } catch (err) {
          summaryExtractive = '';
          summaryByParagraphs = [];
        }
        fetch("http://localhost:80/api/abstractive_summarize", {
          method: "POST",
          mode: 'cors',
          body: JSON.stringify(strippedText),
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
          credentials: "same-origin"
          }).then(function(response) {
            return response.json()
          })
          .then(function(jsonRes) {
            summaryAbstractive = jsonRes['summarize_result'].join(" ");
            fetch("http://localhost:80/api/abstractive_summarize_paragraphs", {
              method: "POST",
              mode: 'cors',
              body: JSON.stringify(strippedText.split(/\n/g)),
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              },
              credentials: "same-origin"
              }).then(function(response) {
                return response.json()
              })
              .then(function(jsonRes) {
                let summaries = [];
                for (let i=0; i<jsonRes.length; i++) {
                  let ps = (jsonRes[i]['summarize_result'].join(" "));
                  if (ps !== "" && ps.length !== 0) {
                    summaries.push(ps);
                  }
                }
                entry['summaryExtractive'] = summaryExtractive;
                entry['summaryByParagraphs'] = summaryByParagraphs;
                entry['summaryAbstractive'] = summaryAbstractive;
                entry['summaryAbstractiveByParagraphs'] = summaries;
                entry['stats'] = {
                  charCount: charCount,
                  syllableCount: syllableCount,
                  wordCount: wordCount,
                  sentenceCount: sentenceCount,
                  avgWordsPerSentence: avgWordsPerSentence,
                  avgSyllablesPerSentence: avgSyllablesPerSentence,
                  avgSyllablesPerWord: avgSyllablesPerWord,
                  fleschReadability: fleschReadability
                };
                entry['wordFrequency'] = getWordFrequency(strippedText);
                const newEntries = replaceEntry(entry, Entries);
                // const res = getContentFromHTML(entry['html']);
                const html = entry['html'];
                this.setState({Entries: newEntries,
                editorType: editorType, editorHtml: html});
              })
            .catch(err => {
              summaryAbstractive = '';
              summaryAbstractiveByParagraphs = [];
                // console.log(err);
                // message.error(err);
            });
          })
        .catch(err => {
          summaryAbstractive = '';
          summaryAbstractiveByParagraphs = [];
            // console.log(err);
            // message.error(err);
        });
      } else {
        summaryExtractive = '';
        summaryAbstractive = '';
        summaryAbstractive = '';
        summaryAbstractiveByParagraphs = [];
      }
      entry['summaryExtractive'] = summaryExtractive;
      entry['summaryByParagraphs'] = summaryByParagraphs;
      entry['stats'] = {
        charCount: charCount,
        syllableCount: syllableCount,
        wordCount: wordCount,
        sentenceCount: sentenceCount,
        avgWordsPerSentence: avgWordsPerSentence,
        avgSyllablesPerSentence: avgSyllablesPerSentence,
        avgSyllablesPerWord: avgSyllablesPerWord,
        fleschReadability: fleschReadability
      }
      entry['wordFrequency'] = getWordFrequency(strippedText);
      const newEntries = replaceEntry(entry, Entries);
      try {
        // saveToDB("entries", newEntries);
        await message.success("Saving notebook changes and analysis results..", 1.2);
        const res = await localforage.setItem("entries", newEntries);
        setState("needAnalysisUpdate", false);
        m_this.props.updateAppMethod();
      } catch (err) {
        message.error("Failed to save notebook! " + err);
        setState("needAnalysisUpdate", false);
      }
    // }
  }

  render() {
    // const editorState = this.state.editorState;
    // const editorEnabled = this.state.editorEnabled;

    // const { editorState } = this.state;

    let editorType = this.state.editorType;
    if (editorType == undefined ||  editorType == null) {
      editorType = "flow";
      setState("editorType", "flow");
    }
    let editor = {};
    switch (editorType) {
      case 'inline':
      editor =     
        <div className="editor-action">
          {/* <MEditor */}
            {/* ref={(e) => {this._editor = e;}} */}
            {/* editorState={editorState} */}
            {/* onChange={this.onChange} */}
            {/* editorEnabled={true} */}
            {/* handleDroppedFiles={this.handleDroppedFiles} */}
            {/* placeholder={"Write your story"} */}
            {/* sideButtons={this.sideButtons} */}
            {/* onChange={this.onChange} /> */}
            {/* /> */}
            <ReactQuill 
              theme={this.state.theme}
              onChange={this.handleChange}
              value={this.state.editorHtml}
              modules={Editor.modules}
              formats={Editor.formats}
              bounds={'.app'}
              placeholder={'Write your story'}
            />
            <div className="themeSwitcher">
              <label>Theme </label>
              <select onChange={(e) => 
                  this.handleThemeChange(e.target.value)}>
                <option value="snow">Snow</option>
                <option value="bubble">Bubble</option>
                {/* <option value="core">Core</option> */}
              </select>
            </div>
          </div>
          break;
        case 'full':
          editor = 
            <React.Fragment>
            <div className="editor">
            <ReactQuill 
          theme={this.state.theme}
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={Notepad.modules}
          formats={Notepad.formats}
          bounds={'.editor'}
          placeholder={'Write your story'}
          />
            <div className="themeSwitcher">
              <label>Theme </label>
              <select onChange={(e) => 
                  this.handleThemeChange(e.target.value)}>
                <option value="snow">Snow</option>
                <option value="bubble">Bubble</option>
                {/* <option value="core">Core</option> */}
              </select>
            </div>
            </div>
            </React.Fragment>
          break;
        case 'code': 
          editor = null;
          break;
        case 'equation':
          editor = null;
          break;
        default:
          editor =     
          <React.Fragment>
          {/* <div className="danteEditorWrapper"> */}
            <div className="editor">
            <ReactQuill 
              theme={this.state.theme}
              onChange={this.handleChange}
              value={this.state.editorHtml}
              modules={Notepad.modules}
              formats={Notepad.formats}
              bounds={'.editor'}
              placeholder={'Write your story'}
            />
            </div>
            </React.Fragment>
    };

    const showAnalysisOverlay = this.props.showAnalysisOverlay;
    return (
      <React.Fragment>
      <div className="notebookSwitch">
        <Tooltip 
          placement="left"
          overlayStyle={{width: '180px', opacity: '.95'}}
          title=
            {"Switch editor mode / default format for entry (must refresh for changes to show)"}
          >
          <Dropdown.Button
            className="dropdownCustom"
            style={{borderRadius: '15px', marginRight: '5px'}}
            dropdownMatchSelectWidth={true}
            // onClick={this.handleDropdownButtonClick}
            overlay={this.buildEditorSwitchMenu}
            >
            <div className="innerButtonLabel">
              <p>                                 
                {editorType.charAt(0).toUpperCase() +
                editorType.slice(1)}
              </p>
            </div>
          </Dropdown.Button>
          </Tooltip>
        </div>
        <div className="saveButtonNotebook">
          <Tooltip title="Save your changes in notebook">              
          <Button 
            shape="circle"
            className="saveButtonNotebook"
            ghost={true}
            icon="save"
            onClick={this.saveNotebookData}
            />
          </Tooltip>
          </div>
        {/* </div> */}
        <React.Fragment>
          {showAnalysisOverlay ? (
            <div className="notebookEditorWrapper">
              {editor}
            </div>
          ) : (
            <div className="notebookEditorWrapperSplit">
              {editor}
            </div>
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Notepad.modules = {
  toolbar: 
  [
    [{ 'header': '1'}, {'header': '2'}, {'header': '4'},  { 'font': [] }],
    [{size: []}],
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],
     [{ 'direction': 'rtl' }],                         // text direction
    ['link', 'image', 'video'],
    [{ 'align': [] }],
    ['clean']
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  }
}
/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Notepad.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'color'
]

/* 
 * PropType validation
 */
Notepad.propTypes = {
  placeholder: PropTypes.string,
}
