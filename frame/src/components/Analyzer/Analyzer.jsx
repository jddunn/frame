'use strict';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider
  } from 'antd';

import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';

import Visualizer from '../Visualizer/Visualizer';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import ReactJson from 'react-json-view';
// import DOMify from 'react-domify';

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import './tabStyle.css';;
import './Analyzer.scss';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

export default class Analyzer extends Component {

  constructor(props) {
    super(props);
    this.state = { placement: 'bottom', _isMounted: false,
                    selectedEntry: {},
                    Entries: [],
                    lastEntryId: "",
                  };
    this.getEntries = this.getEntries.bind(this);
    this.buildInformationExtraction = this.buildInformationExtraction.bind(this);
    this.buildSummaries = this.buildSummaries.bind(this);
  }
  
  onClose = () => {
    setState("analysisDrawerVisible", false);
    this.props.updateAppMethod();
  };

  onChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  }

  callback = (key) => {
    // console.log(key);
  }

  
  callback2 = (key) => {
    // console.log(key);
  }

  buildInformationExtraction(entry) {
    let divContainerLeft = [];
    let divContainerRight = [];
    let divContainers = []; /** We'll be returning an array within an array */
    let people, places, phoneNumbers, hashtags, 
        questions, quotes, topics, dates, statements,
        urls, terms, bigrams, trigrams, organizations;
    /** Also return this so we can expand items with values by default */
    let defaultOpenKeysLeft = [];
    let defaultOpenKeysRight = [];

    let detectedLanguagesContainer;

    try {
      if (entry !== null && entry !== undefined) {
        let detectedLanguages = entry['detectedLanguages'];
        if (detectedLanguages === undefined || detectedLanguages === null) detectedLanguages = [];
        let detectedLanguagesLength = detectedLanguages.length;
        let showArrow = false;
        if (detectedLanguagesLength > 0) { defaultOpenKeysRight.push('11'); showArrow = true; }
        let entityTitle = "Languages Detected (ISO 639-3)\xa0\xa0  \xa0\xa0 (" + detectedLanguagesLength + ") \xa0\xa0";
        detectedLanguagesContainer = (
          <Panel header={entityTitle} key="11" showArrow={showArrow}>
            <pre>
              <p>{JSON.stringify(detectedLanguages, null, 2)}</p>
            </pre>
          </Panel>
        );
      }
    } catch (err) {
    }

    try {
      if (entry !== null && entry !== undefined) {
        const entities = Object.entries(entry['entities']);
        for (let i=0; i<entities.length; i++) {
          const propKey = entities[i][0];
          const propVal = entities[i][1];
          /**
           * This extremely long series of if else statements
           * is so we can build out the div components for entities
           * in a specific order, with specific styles based on the
           * type (as opposed to looping through and adding values 
           * to a dictionary, for example).
           * 
           * Currently, the order of which the items are saved / rendered
           * in the Analyzer component is determined by how the entry data
           * is saved in Notepad.
           */
          if (propKey === 'topics') {
            topics = entities[i][1];
            if (topics === undefined || topics === null) topics = [];
            let topicsLength = topics.length;
            let showArrow = false;
            if (topicsLength > 0) { defaultOpenKeysRight.push('1'); showArrow = true; }
            let entityTitle = "Topics \xa0\xa0  \xa0\xa0 (" + topicsLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="1" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(topics, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'terms') {
            terms = entities[i][1];
            if (terms === undefined || terms === null) terms = [];
            let termsLength = terms.length;
            let showArrow = false;
            if (termsLength > 0) { defaultOpenKeysLeft.push('2'); showArrow = true; }
            let entityTitle = "Terms \xa0\xa0  \xa0\xa0 (" + termsLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="2" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(terms, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'people') {
            people = entities[i][1];
            if (people === undefined || people === null) people = [];
            let peopleLength = people.length;
            let showArrow = false;
            if (peopleLength > 0) { defaultOpenKeysLeft.push('3'); showArrow = true; }
            let entityTitle = "People \xa0\xa0  \xa0\xa0 (" + peopleLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="3" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(people, null, 2)}</p>
                </pre>
              </Panel>
            )
          } 
          if (propKey === 'dates') {
            dates = entities[i][1];
            if (dates === undefined || dates === null) dates = [];
            let datesLength = dates.length;
            let showArrow = false;
            if (datesLength > 0) { defaultOpenKeysLeft.push('4'); showArrow = true; }
            let entityTitle = "Dates \xa0\xa0  \xa0\xa0 (" + datesLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="4" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(dates, null, 2)}</p>
                </pre>
              </Panel>
            )
          } 
          if (propKey === 'places') {
            places = entities[i][1];
            if (places === undefined || places === null) places = [];
            let placesLength = places.length;
            let showArrow = false;
            if (placesLength > 0) { defaultOpenKeysLeft.push('5'); showArrow = true; }
            let entityTitle = "Places \xa0\xa0  \xa0\xa0 (" + placesLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="5" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(places, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'organizations') {
            organizations = entities[i][1];
            if (organizations === undefined || organizations === null) organizations = [];
            let organizationsLength = organizations.length;
            let showArrow = false;
            if (organizationsLength > 0) { defaultOpenKeysLeft.push('6'); showArrow = true; }
            let entityTitle = "Organizations \xa0\xa0  \xa0\xa0 (" + organizationsLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="6" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(organizations, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'phoneNumbers') {
            phoneNumbers = entities[i][1];
            if (phoneNumbers === undefined || phoneNumbers === null) phoneNumbers = [];
            let phoneNumbersLength = phoneNumbers.length;
            let showArrow = false;
            if (phoneNumbersLength > 0) { defaultOpenKeysLeft.push('7'); showArrow = true; }
            let entityTitle = "Phone Numbers \xa0\xa0  \xa0\xa0 (" + phoneNumbersLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="7" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(phoneNumbers, null, 2)}</p>
                </pre>
              </Panel>
            )
          } 
          if (propKey === 'hashtags') {
            hashtags = entities[i][1];
            if (hashtags === undefined || hashtags === null) hashtags = [];
            let hashtagsLength = hashtags.length;
            let showArrow = false;
            if (hashtagsLength > 0) { defaultOpenKeysLeft.push('8'); showArrow = true; }
            let entityTitle = "Hashtags \xa0\xa0  \xa0\xa0 (" + hashtagsLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="8" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(hashtags, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'urls') {
            urls = entities[i][1];
            if (urls === undefined || urls === null) urls = [];
            let urlsLength = urls.length;
            let showArrow = false;
            if (urlsLength > 0) { defaultOpenKeysLeft.push('9'); showArrow = true; }
            let entityTitle = "URL Links \xa0\xa0  \xa0\xa0 (" + urlsLength + ") \xa0\xa0";
            divContainerLeft.push(
              <Panel header={entityTitle} key="9" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(urls, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'quotes') {
            quotes = entities[i][1];
            if (quotes  === undefined || quotes === null) quotes = [];
            let quotesLength = quotes.length;
            let showArrow = false;
            if (quotesLength > 0) { defaultOpenKeysRight.push('10'); showArrow = true; }
            let entityTitle = "Quotations \xa0\xa0  \xa0\xa0 (" + quotesLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="10" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(quotes, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'statements') {
            statements = entities[i][1];
            if (statements === undefined || statements === null) statements = [];
            let statementsLength = statements.length;
            let showArrow = false;
            if (statementsLength > 0) { defaultOpenKeysRight.push('11'); showArrow = true; }
            let entityTitle = "Statements \xa0\xa0  \xa0\xa0 (" + statementsLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="12" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(statements, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'questions') {
            questions = entities[i][1];
            if (questions === undefined || questions === null) questions = [];
            let questionsLength = questions.length;
            let showArrow = false;
            if (questionsLength > 0) { defaultOpenKeysRight.push('12'); showArrow = true; }
            let entityTitle = "Questions \xa0\xa0  \xa0\xa0 (" + questionsLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="13" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(questions, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'bigrams') {
            bigrams = entities[i][1];
            if (bigrams === undefined || bigrams === null) bigrams = [];
            let bigramsLength = bigrams.length;
            let showArrow = false;
            if (bigramsLength > 0) { defaultOpenKeysRight.push('13'); showArrow = true; }
            let entityTitle = "Bigrams \xa0\xa0  \xa0\xa0 (" + bigramsLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="14" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(bigrams, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
          if (propKey === 'trigrams') {
            trigrams = entities[i][1];
            if (trigrams === undefined || trigrams === null) trigrams = [];
            let trigramsLength = trigrams.length;
            let showArrow = false;
            if (trigramsLength > 0) { defaultOpenKeysRight.push('14'); showArrow = true; }
            let entityTitle = "Trigrams \xa0\xa0  \xa0\xa0 (" + trigramsLength + ") \xa0\xa0";
            divContainerRight.push(
              <Panel header={entityTitle} key="15" showArrow={showArrow}>
                <pre>
                  <p>{JSON.stringify(trigrams, null, 2)}</p>
                </pre>
              </Panel>
            )
          }
        }
      }
    } catch (err) {
      // console.log("INFO ERR: ", err);
    }
    divContainers.push(divContainerLeft);
    divContainerRight.splice(1, 0, detectedLanguagesContainer)
    divContainers.push(divContainerRight);
    divContainers.push(defaultOpenKeysLeft);
    divContainers.push(defaultOpenKeysRight);
    return (
      divContainers
    );
  }

  buildSummaries(entry) {
    const abstractiveSummary = entry['summaryAbstractive'];
    const extractiveSummary = entry['summaryExtractive'];
    const summaryByParagraphs = entry['summaryByParagraphs'];
    const defaultOpenKeys = [];
    let showArrow;
    const container = [];
    const res = [];
    let div;
    // console.log(abstractiveSummary, extractiveSummary, summaryByParagraphs);
    try {
      if (abstractiveSummary.length > 0 && Array.isArray(abstractiveSummary)) {
        showArrow = true;
        defaultOpenKeys.push('1');
      } else {
        showArrow = false;
      }
      div = (
        <Panel className="panelHeaderBorderless" header="Abstractive Summary" key="1" showArrow={showArrow}>
          <div className="abstractiveSummaryContainer">
            <p className="summaryContent">{abstractiveSummary}</p>
          </div>
        </Panel>
        );
      container.push(div);
    } catch (err) {
      div = (
        <Panel className="panelHeaderBorderless" header="Abstractive Summary" key="1" showArrow={false}>
          <div className="abstractiveSummaryContainer">
            <p className="summaryContent">{abstractiveSummary}</p>
          </div>
        </Panel>
        );
      container.push(div);
    }
    try {
      if (extractiveSummary.length > 0) {
        showArrow = true;
        defaultOpenKeys.push('2');
      } else {
        showArrow = false;
      }
      div = (
        <Panel className="panelHeaderBorderless" header="Extractive Summary" key="2" showArrow={showArrow}>
          <div className="extractiveSummaryContainer">
            <p className="summaryContent">{extractiveSummary}</p>
          </div>
        </Panel>
        );
      container.push(div);
    } catch (err) {
      div = (
        <Panel className="panelHeaderBorderless" header="Extractive Summary" key="2" showArrow={false}>
          <div className="extractiveSummaryContainer">
            <p className="summaryContent">{extractiveSummary}</p>
          </div>
        </Panel>
        );
        container.push(div);
    }
    let paragraphs = [];
    let filteredSummaryByParagraphs = [];
    try {
        filteredSummaryByParagraphs = summaryByParagraphs.filter(function (el) {
          return el != null && el != '';
      });
    } catch(err) {
    }
    try {
      if (filteredSummaryByParagraphs.length > 0) {
        showArrow = true;
        defaultOpenKeys.push('3');
        for (let i=0; i<filteredSummaryByParagraphs.length; i++) {
          paragraphs.push(<p className="summaryContent">{filteredSummaryByParagraphs[i]}</p>)
        }
      } else {
        showArrow = false;
      }
      div = (
        <Panel className="panelHeaderBorderless" header="Summary by Paragraph" key="3" showArrow={showArrow}>
          <div className="summaryByParagraphsContainer">
          {paragraphs}
          </div>
        </Panel>
        );
        container.push(div);
    } catch (err) {
      div = (
        <Panel className="panelHeaderBorderless" header="Summary by Paragraph" key="3" showArrow={false}>
          <div className="summaryByParagraphsContainer">
          </div>
        </Panel>
        );
      container.push(div);
    }
    res.push(defaultOpenKeys);
    res.push(container);
    return res;
  }

  async getEntries(Library, key) {
    let Entries = [];
    await getFromDB(Library, key).then(function(result) {
      Entries = result;
    }).catch(function(err) {
      Entries = [];
    });
    return Entries;
  }

  async componentWillMount() {
    this.setState({_isMounted: true});

  }

  componentWillUnmount() {
    this.setState({_isMounted: false});
  }

  async componentWillUpdate() {
    if (this.state._isMounted) {
      const entryId = getState("entryId");
      const library = getState("library");
      const Library = openDB(library);
      if (this.state.lastEntryId !== entryId) {
        await this.getEntries(Library, "entries").then(async(result) => {
          const Entries = result;
          const entry = traverseEntriesById(entryId, Entries);
          if (entry != null) {
            this.setState({Entries: Entries, selectedEntry: entry, lastEntryId: entryId});
          }
        })
      this.forceUpdate();
      }
    }
  }

  async componentWillReceiveProps(nextProps) {
    if (this.state._isMounted) {
      const entryId = nextProps.entryId;
      const m_nextProps = nextProps;
      const library = getState("library");
      const Library = openDB(library);
      await this.getEntries(Library, "entries").then(async(result) => {
        const Entries = result;
        const entry = traverseEntriesById(entryId, Entries);
        if (entry != null) {
          this.setState({Entries: Entries, selectedEntry: entry, lastEntryId: entryId});
        }
      })
    this.forceUpdate();
    }
  }

  render() {
    const entryId = getState("entryId");
    const library = getState("library");
    const Library = openDB(library);
    const _this = this;

    let drawerTitle = "";

    let analysisDrawerVisible = getState("analysisDrawerVisible");
    if (analysisDrawerVisible == null || analysisDrawerVisible == undefined ||
        analysisDrawerVisible == "undefined"
    ) {
        analysisDrawerVisible = false;
    }
    if (this.state._isMounted) {
      let selectedEntry = this.state.selectedEntry;

      if (selectedEntry == null || selectedEntry == undefined ||
          selectedEntry == "undefined"
        ) {
          selectedEntry = Entries[0];
      }
      const Entries = this.state.Entries;
      drawerTitle = '' + selectedEntry.title + '' + '\xa0\xa0\xa0\xa0-\xa0\xa0\xa0\xa0Analysis';
      const dateCreated = selectedEntry.dateCreated;
      let entryTags = selectedEntry.tags;
      
      let charCount; 
      let wordCount; 
      let sentenceCount; 
      let syllableCount; 
      let avgSyllablesPerWord; 
      let avgSyllablesPerSentence; 
      let avgWordsPerSentence;
      let fleschReadability; 
      let fleschReadabilityDescription;
      try {
        charCount = selectedEntry['stats']['charCount'];
        wordCount = selectedEntry['stats']['wordCount'];
        sentenceCount = selectedEntry['stats']['sentenceCount'];
        syllableCount = selectedEntry['stats']['syllableCount'];
        avgSyllablesPerWord = selectedEntry['stats']['avgSyllablesPerWord'];
        avgSyllablesPerSentence = selectedEntry['stats']['avgSyllablesPerSentence'];
        avgWordsPerSentence = selectedEntry['stats']['avgWordsPerSentence'];
        fleschReadability = selectedEntry['stats']['fleschReadability'];
      } catch (err) {
        // console.log(err);
      }
      if (fleschReadability != null && fleschReadability != undefined &&
        fleschReadability != "undefined") {
          if (fleschReadability >= 90) {
            fleschReadabilityDescription = fleschReadability.toString() +
            '  -  Very easy to read (5th - 6th grade reading level)';
          } else if (fleschReadability >= 65) {
            fleschReadabilityDescription = fleschReadability.toString() +
            '  -  Fairly easy to read (6th - 7th grade reading level)';
          } else if (fleschReadability >= 50) {
            fleschReadabilityDescription = fleschReadability.toString() + 
            ' - Fairly difficult to read (10th - 12th grade reading level)';
          } else if (fleschReadability >= 35) {
            fleschReadabilityDescription = fleschReadability.toString() + 
            ' - Difficult to read (College reading level)';
          } else if (fleschReadability < 35) {
            fleschReadabilityDescription = fleschReadability.toString() + 
            ' - Difficult to read (College graduate reading level)';
          } else {
            fleschReadabilityDescription = fleschReadability;
          }
      }
      try {
        entryTags = entryTags.split(' ').join(' ');
      } catch (err) {
        entryTags = 'none';
      }
      if (entryTags.length <= 0) {
        entryTags = 'none';
      }

      const informationExtractionResults = this.buildInformationExtraction(selectedEntry);
      const summariesResults = this.buildSummaries(selectedEntry);
      const defaultOpenSummaries = summariesResults[0];
      const summariesResultsContent = summariesResults[1];

      const entitiesContainerLeft = informationExtractionResults[0];
      const entitiesContainerRight = informationExtractionResults[1];
      const entitiesDefaultOpenKeysLeft = informationExtractionResults[2];
      const entitiesDefaultOpenKeysRight = informationExtractionResults[3];

      let extractiveSummary = selectedEntry['summaryExtractive'];
      if (extractiveSummary === null || extractiveSummary === "undefined" ||
        extractiveSummary === "undefined") 
      { 
        extractiveSummary = '';
      }
      let summaryByParagraphs = selectedEntry['summaryByParagraphs'];

      if (summaryByParagraphs === null || summaryByParagraphs === "undefined" ||
      summaryByParagraphs === "undefined") 
      { 
        summaryByParagraphs = [];
      }

      let summaryByParagraphsContainer = [];
      try {
        for (let i=0; i<summaryByParagraphs.length; i++) {
          summaryByParagraphsContainer.push(<p>{summaryByParagraphs[i]}</p>)
        }
      } catch (err) {
        // console.log("ERRRR: ", err);
      }
      let detectedLanguages = selectedEntry['detectedLanguages'];
      let detectedLanguage;
      try {
        detectedLanguage = selectedEntry['detectedLanguages'][0]
      } catch (err) {
        detectedLanguage = "none";
      }
      return(
        <div className="analysisContainer">

          <Drawer
            title={drawerTitle}
            mask={false}
            placement={_this.state.placement}
            closable={true}
            onClose={_this.onClose}
            visible={analysisDrawerVisible}
          >
            {/* Tab components */}
            <Wrapper letterNavigation={true}>
              <TabList>
                <ul className='FancyTabs-tablist'>

                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t1' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' /> */}
                          <span className='FancyTabs-tabText'>
                            Overview
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>

                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t6' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' /> */}
                          <span className='FancyTabs-tabText'>
                            Visualizations
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                  
                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t2' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' /> */}
                          <span className='FancyTabs-tabText'>
                            Ask
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t3' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--megaphone' /> */}
                          <span className='FancyTabs-tabText'>
                            Summarize
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t4' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--trophy' /> */}
                          <span className='FancyTabs-tabText'>
                            Information Extraction
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>

                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t5' className='FancyTabs-tab'>
                      {analysisTabs.bind(null, (
                        <div>
                          {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--trophy' /> */}
                          <span className='FancyTabs-tabText'>
                            Metadata
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                </ul>
              </TabList>
              <div className='FancyTabs-panel'>
                <TabPanel tabId='t1'>
                  <div className='FancyTabs-panelInner'>

                  <div className="visualizationsContainer">
                  </div>

                  <div className="analysisStatsContainer">
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Character Count
                    </h4>
                    <h4 className="tabInnerContent">
                        {charCount}
                    </h4>
                  </div>
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Word Count
                    </h4>
                    <h4 className="tabInnerContent">
                        {wordCount}
                    </h4>
                  </div>
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Sentence Count
                    </h4>
                    <h4 className="tabInnerContent">
                      {sentenceCount}
                    </h4>
                  </div>
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Average Syllables Per Word
                    </h4>
                    <h4 className="tabInnerContent">
                        {avgSyllablesPerWord}
                    </h4>
                  </div>
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Average Syllables Per Sentence
                    </h4>
                    <h4 className="tabInnerContent">
                      {avgSyllablesPerSentence}
                    </h4>
                  </div>
                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Avgerage Words Per Sentence
                    </h4>
                    <h4 className="tabInnerContent">
                      {avgWordsPerSentence}
                    </h4>
                  </div>
                  <div className="tabInnerSection">                  
                    <h4 className="tabInnerLabel">
                      Readability Index (Flesch–Kincaid)
                    </h4>
                    <h4 className="tabInnerContent">
                      {fleschReadabilityDescription}
                    </h4>
                  </div>

                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Entry ID
                    </h4>
                    <h4 className="tabInnerContent">
                        {selectedEntry.id}
                    </h4>
                  </div>

                  <div className="tabInnerSection">                  
                    <h4 className="tabInnerLabel">
                      Entry Language
                    </h4>
                    <h4 className="tabInnerContent">
                        {detectedLanguage}
                    </h4>
                  </div>

                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                        Category Tags
                    </h4>
                    <h4 className="tabInnerContent">
                        {entryTags}
                    </h4>
                  </div>

                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Date Created
                    </h4>
                    <h4 className="tabInnerContent">
                        {dateCreated}
                    </h4>
                  </div>

                  <div className="tabInnerSection">
                    <h4 className="tabInnerLabel">
                      Move Dialog
                    </h4>
                    <div className="tabInnerContent">
                        <RadioGroup
                          style={{ marginRight: 8 }}
                          defaultValue={this.state.placement}
                          onChange={this.onChange}
                        >
                          <Radio value="top">top</Radio>
                          <Radio value="right">right</Radio>
                          <Radio value="bottom">bottom</Radio>
                          <Radio value="left">left</Radio>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
                </TabPanel>

                <TabPanel tabId='t6'>
                  <Visualizer entry={selectedEntry}/>
                </TabPanel>

                <TabPanel tabId='t2'>
                  <div className='FancyTabs-panelInner'>
                    Ut <a href='#'>enim</a> ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </div>
                </TabPanel>
                <TabPanel tabId='t3'>
                  <div className='FancyTabs-panelInner'>
                    <Collapse bordered={false} defaultActiveKey={defaultOpenSummaries}>
                      {summariesResultsContent}
                    </Collapse>
                  </div>
                </TabPanel>
                <TabPanel tabId='t4'>
                  <div className='FancyTabs-panelInner'>
                    <div className="entitiesCollapseLeft">
                      <Collapse defaultActiveKey={entitiesDefaultOpenKeysLeft} onChange={this.callback}>
                        {entitiesContainerLeft}
                      </Collapse>
                    </div>
                    <div className="entitiesCollapseRight">
                      <Collapse defaultActiveKey={entitiesDefaultOpenKeysRight} onChange={this.callback2}>
                        {entitiesContainerRight}
                      </Collapse>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel tabId='t5'>
                  <ReactJson src={selectedEntry} />
                </TabPanel>
              </div>
            </Wrapper>
            {/* End tabs */}
          </Drawer>
        </div>
      );
    } else {
      return null;
    }
  }
}

// Tab switch handler
function analysisTabs(content, tabState) {
  let cl = 'FancyTabs-tabInner';
  if (tabState.isActive) cl += ' is-active';
  return (
    <div className={cl}>
      {content}
    </div>
  );
}