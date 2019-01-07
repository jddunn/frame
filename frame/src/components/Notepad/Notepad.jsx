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
import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';
// TODO: Refactor out Editor and MEditor into different React components
import { Editor} from 'react-draft-wysiwyg'; // Full text editor
import { Editor as MEditor } from 'medium-draft'; // Medium-style text editor

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';
import localforage from "localforage";

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
 
import {
  KeyBindingUtil,
  Modifier,
  AtomicBlockUtils,
} from 'draft-js';
import {
  Block,
  createEditorState,
  addNewBlockAt,
  getCurrentBlock,
  ImageSideButton,
  BreakSideButton,
} from '../vendor/index';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'medium-draft/lib/index.css';
import '../vendor/components/addbutton.scss';
import '../vendor/components/toolbar.scss';
import '../vendor/components/blocks/text.scss';
import '../vendor/components/blocks/atomic.scss';
import '../vendor/components/blocks/blockquotecaption.scss';
import '../vendor/components/blocks/caption.scss';
import '../vendor/components/blocks/todo.scss';
import '../vendor/components/blocks/image.scss';
// Local style
import './Notepad.scss';
import { getHTMLFromContent, getContentFromHTML, HTMLToText } from "../../utils/translate-html";

const Option = Select.Option;

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

  static propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    close: PropTypes.func,
  };
  
  constructor(props) {

    super(props);

    this.state = {
      editorState: createEditorState(),
      editorEnabled: true,
      placeholder: 'Write here...',
      _isMounted: false,
      editorType: "flow",
      // Keep track of the last known entry / editor in state to reduce
      // unnecessary rendering
      prevEditorState: {},
      prevEntryId: ""
      // uploadedImages: [],
    };

    this.sideButtons = [{
        title: 'Image',
        component: ImageSideButton,
      }, {
        title: 'Embed',
        component: EmbedSideButton,
      },
      {
        title: 'Break',
        component: BreakSideButton,
      }
    ];

    // this.exporter = setRenderOptions({
      // styleToHTML,
      // blockToHTML: newBlockToHTML,
      // entityToHTML: newEntityToHTML,
    // });

    this.handleEditorSwitchClick = this.handleEditorSwitchClick.bind(this);

    this.getEntries = this.getEntries.bind(this);
    this.getEditorState = this.getEditorState.bind(this);
    this.setEditorState = this.setEditorState.bind(this);
    this.handleDroppedFiles = this.handleDroppedFiles.bind(this);
    this.onChange = this.onChange.bind(this);

    this.onEditorStateChange = this.onEditorStateChange.bind(this); 
    this.refsEditor = React.createRef();
    this.uploadImageCallBack = this.uploadImageCallBack.bind(this);
    // this._uploadImageCallBack = this._uploadImageCallBack.bind(this);

    // Save content in Notebook comp to db
    this.saveNotebookData = this.saveNotebookData.bind(this);

    this.sleep = this.sleep.bind(this);
  }

  async getEntries(key) {
    let Entries = [];
    Entries = await getFromDB(key);
    // then(function(result) {
    //   Entries = result;
    // }).catch(function(err) {
    //   Entries = [];
    // });
    // Entries = getFromDB(Library, key)
    return Entries;
  }

  getEditorState() {
    return(this.state.editorState);
  }

  setEditorState(state) {
    if (state !== this.state.prevEditorState) {
      this.setState({editorState: state, prevEditorState: state});
    }
  }
  
  onChange = (editorState, callback = null) => {
    if (this.state._isMounted)
      if (this.state.editorEnabled) {
        if (editorState !== this.state.prevEditorState) {
          this.setState({ editorState }, () => {
            if (callback) {
              callback();
            }
        });
      }
    }
  };

  onEditorStateChange = (editorState) => {
    // console.log("Editor state change: ", editorState);
    if (this.state._isMounted) 
    if (editorState !== this.state.prevEditorState) {
      this.setState({
        editorState,
      });
    }
  }

  componentDidMount() {
    const entryIdProp = this.props.entryId;
    const EntriesProp = this.props.Entries;
    const entryProp = this.props.entry;
    try {
      const blocksFromHTML = convertFromHTML(entryProp['html']);
      const editorContent = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      this.setState({_isMounted: true, editorState: EditorState.createWithContent(editorContent), entryId: entryIdProp,
        Entries: EntriesProp, entry: entryProp, prevEditorState: EditorState.createWithContent(editorContent), 
        prevEntryId: entryIdProp
      });
    } catch (err) {
      console.log("Notebook mount err: ", err);
      this.setState({_isMounted: true, editorState: EditorState.createEmpty(), prevEditorState: EditorState.createEmpty(), entryId: entryIdProp,
                    Entries: EntriesProp, entry: entryProp, prevEntryId: entryIdProp
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
      if (nextEntryId === this.state.prevEntryId) {
        return;
      }  
      const nextEntry = nextProps.entry;
      const nextEntries = nextProps.Entries;
      const library = defaultFLib;
      const Library = openDB(library);
      let editorType;
      // try {
      //   const blocksFromHTML = convertFromHTML(nextEntry['html']);
      //   const editorContent = ContentState.createFromBlockArray(
      //     blocksFromHTML.contentBlocks,
      //     blocksFromHTML.entityMap
      //   );
      //   this.setState({editorState: EditorState.createWithContent(editorContent), entryId: entryId,
      //     Entries: nextEntries, entry: nextEntry
      //   });
      // } catch (err) {
      //   this.setState({editorState: EditorState.createEmpty(), entryId: nextEntryId,
      //                 Entries: nextEntries, entry: nextEntry
      //   });
      // }
      let Entries = nextEntries;
      let entry = nextEntry;
      let entryId = nextEntryId;
      try { 
        editorType = entry.editorType;
      } catch (err) {
        editorType = "flow";
        setState("editorType", "flow");
      }


      const splitNotebookLayout = nextProps.splitNotebookLayout;
  
      if (entry['html'] !== null && entry['html'] !== undefined && entry['html'] !== "<p></p>") {
        if (splitNotebookLayout) {
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
                    const res = getContentFromHTML(entry['html']);
                    _this.setState({Entries: newEntries, editorState: res,
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
                  const res = getContentFromHTML(entry['html']);
                  _this.setState({Entries: newEntries,  editorState: res,
                  editorType: editorType});
                  // console.log(err);
                  // message.error(err);
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
              const res = getContentFromHTML(entry['html']);
              _this.setState({Entries: newEntries,  editorState: res,
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
          }
        }
        const newEntries = replaceEntry(entry, Entries);
        const res = getContentFromHTML(entry['html']);
        _this.setState({Entries: newEntries,  editorState: res,
        editorType: editorType});
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

  this.props.updateAppMethod();
  }


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
    // let entryId = getState("entryId");
    let entry = this.state.entry;
    const entryId = this.state.entryId;
    const Entries = this.state.Entries;
    let editorType = entry['editorType'];
    // let library = getState("library");
    let library = defaultFLib;
    // const editorType = getState("editorType");
    const Library = openDB(library);
    const m_this = this;

    if (entry !== null && entry !== undefined) {
      entry['html'] = getHTMLFromContent(this.state.editorState);
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
          // console.log(err);
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
                const res = getContentFromHTML(entry['html']);
                this.setState({Entries: newEntries, editorState: res,
                editorType: editorType});
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
        message.success("Saving notebook changes and analysis results..");
        const res = await localforage.setItem("entries", newEntries);
        m_this.props.updateAppMethod();
      } catch (err) {
        message.error("Failed to save notebook! " + err);
      }
    }
  }

  handleDroppedFiles(selection, files) {
    window.ga('send', 'event', 'draftjs', 'filesdropped', files.length + ' files');
    const file = files[0];
    if (file.type.indexOf('image/') === 0) {
      // eslint-disable-next-line no-undef
      const src = URL.createObjectURL(file);
      this.onChange(addNewBlockAt(
        this.state.editorState,
        selection.getAnchorKey(),
        Block.IMAGE, {
          src,
        }
      ));
      // return HANDLED;
    }
    // return NOT_HANDLED
    return;
  }

  uploadImageCallBack(file) {
    console.log(file);
    // return new Promise(
    //   (resolve, reject) => {
    //   const selectionState = this.getEditorState().getSelection();
    //   const anchorKey = selectionState.getAnchorKey();
    //   console.log(file);
    //   if (file.type.indexOf('image/') === 0) {
    //     const src = URL.createObjectURL(file);
    //     this.onChange(addNewBlockAt(
    //       this.getEditorState(),
    //       anchorKey,
    //       Block.IMAGE, {
    //         src: src,
    //       }
    //     ));
    //     // resolve(this.getEditorState());
    //   }
    // });
    // return;
    return new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.imgur.com/3/image');
        xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
        const data = new FormData();
        data.append('image', file);
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        });
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        });
      }
    );
  }

  // _uploadImageCallBack(file){
  //   // long story short, every time we upload an image, we
  //   // need to save it to the state so we can get it's data
  //   // later when we decide what to do with it.
    
  //  // Make sure you have a uploadImages: [] as your default state
  //   let uploadedImages = this.state.uploadedImages;

  //   const imageObject = {
  //     file: file,
  //     localSrc: URL.createObjectURL(file),
  //   }

  //   uploadedImages.push(imageObject);

  //   this.setState({uploadedImages: uploadedImages})
    
  //   // We need to return a promise with the image src
  //   // the img src we will use here will be what's needed
  //   // to preview it in the browser. This will be different than what
  //   // we will see in the index.md file we generate.
  //   return new Promise(
  //     (resolve, reject) => {
  //       resolve({ data: { link: imageObject.localSrc } });
  //     }
  //   );
  // }


  render() {
    const editorState = this.state.editorState;
    const editorEnabled = this.state.editorEnabled;
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
          <MEditor
            ref={(e) => {this._editor = e;}}
            editorState={editorState}
            onChange={this.onChange}
            editorEnabled={true}
            handleDroppedFiles={this.handleDroppedFiles}
            placeholder={"Write your story"}
            sideButtons={this.sideButtons}
            onChange={this.onChange} />
            />
          </div>
          break;
        case 'full':
          editor = 
          <React.Fragment>
        <div className="editor">
          <Editor
            spellCheck
            placeholder="Write your story"
            editorState={this.state.editorState} 
            onEditorStateChange={this.onEditorStateChange}
            ref={(element) => { this.editor = element; }}
            toolbar={{
              // colorPicker: { component: ColorPic },
              inline: { inDropdown: true },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
              fontFamily: {
                options: ['Arial', 'Georgia', 'Impact', 'Tahoma','Times New Roman', 'Verdana']},
              image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: false } },
            }}
            />
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
          <div className="danteEditorWrapper">
            <div className="editor-action">
              <MEditor
                ref={(e) => {this._editor = e;}}
                editorState={editorState}
                onChange={this.onChange}
                editorEnabled={true}
                handleDroppedFiles={this.handleDroppedFiles}
                placeholder={"Write your story"}
                sideButtons={this.sideButtons}
              />
            </div>
          </div>
    };

    const splitNotebookLayout = this.props.splitNotebookLayout;
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
          {splitNotebookLayout ? (
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


// Medium-draft sidebar menu comps

class SeparatorSideButton extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let editorState; 
    try {
      editorState = this.props.getEditorState();
      const content = editorState.getCurrentContent();
      const contentWithEntity = content.createEntity('separator', 'IMMUTABLE', {});
      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
      this.props.setEditorState(
        AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          '-'
        )
      );
      this.props.close();
    } catch (err) {
    }
  }

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add a separator"
        onClick={this.onClick}
      >
        <i className="fa fa-minus" />
      </button>
    );
  }
}

class EmbedSideButton extends React.Component {

  static propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    close: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.addEmbedURL = this.addEmbedURL.bind(this);
  }

  onClick() {
    const url = window.prompt('Enter a URL', 'https://www.youtube.com/watch?v=PMNFaAUs2mo');
    this.props.close();
    if (!url) {
      return;
    }
    this.addEmbedURL(url);
  }

  addEmbedURL(url) {
    try {
      let editorState = this.props.getEditorState();
      const content = editorState.getCurrentContent();
      const contentWithEntity = content.createEntity('embed', 'IMMUTABLE', {url});
      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
      this.props.setEditorState(
        AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          'E'
        )
      );
    } catch (err) {
    }
  }

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add an Embed"
        onClick={this.onClick}
      >
        <i className="fa fa-code" />
      </button>
    );
  }
}
