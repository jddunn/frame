'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import Resizable from 're-resizable';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio
  } from 'antd';

import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import ReactJson from 'react-json-view'

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import './tabStyle.css';;
import './Analyzer.scss';

const RadioGroup = Radio.Group;

export default class Analyzer extends Component {

  constructor(props) {
    super(props);
    this.state = { placement: 'bottom', _isMounted: false,
                    selectedEntry: {},
                    Entries: []};
    this.getEntries = this.getEntries.bind(this);
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
          this.setState({Entries: Entries, selectedEntry: entry});
        }
      })
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
        console.log(err);
      }
      if (fleschReadability != null && fleschReadability != undefined &&
        fleschReadability != "undefined") {
          if (fleschReadability >= 90) {
            fleschReadabilityDescription = fleschReadability.toString() +
            '  -  Very easy to read (5th - 6th grade reading level)';
          } else if (fleschReadability >= 65) {
            fleschReadabilityDescription = fleschReadability.toString() +
            '  -  Fairly Easy To Read (6th - 7th grade reading level)';
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
        entryTags = entryTags.split(' ').join(', ');
      } catch (err) {
        entryTags = 'none';
      }
      if (entryTags.length <= 0) {
        entryTags = 'none';
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
                            Analysis Overview
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
                            Ask Question
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
                            Summary
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
                    {/* Lorem <a href='#'>ipsum</a> dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. */}
                  </div>
                </TabPanel>
                <TabPanel tabId='t2'>
                  <div className='FancyTabs-panelInner'>
                    Ut <a href='#'>enim</a> ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </div>
                </TabPanel>
                <TabPanel tabId='t3'>
                  <div className='FancyTabs-panelInner'>
                    Duis <a href='#'>aute</a> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </div>
                </TabPanel>
                <TabPanel tabId='t4'>
                  <div className='FancyTabs-panelInner'>
                    Duis <a href='#'>aute</a> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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

function analysisTabs(content, tabState) {
  let cl = 'FancyTabs-tabInner';
  if (tabState.isActive) cl += ' is-active';
  return (
    <div className={cl}>
      {content}
    </div>
  );
}