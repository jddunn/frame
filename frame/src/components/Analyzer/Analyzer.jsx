'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import Resizable from 're-resizable';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, RadioGroup
  } from 'antd';

import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

// TODO: Refactor out Editor and MEditor into different React components
import { Editor} from 'react-draft-wysiwyg'; // Full text editor
import { Editor as MEditor } from 'medium-draft'; // Medium-style text editor

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import './tabStyle.css';;
import './Analyzer.scss';

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

    let divContainer = null;

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
      drawerTitle = '"' + selectedEntry.title + '"' + '   (' +
        selectedEntry.id + ')     -   Analysis';
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
                      {demoTab.bind(null, (
                        <div>
                          <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' />
                          <span className='FancyTabs-tabText'>
                            Maps
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t2' className='FancyTabs-tab'>
                      {demoTab.bind(null, (
                        <div>
                          <span className='FancyTabs-tabIcon FancyTabs-tabIcon--megaphone' />
                          <span className='FancyTabs-tabText'>
                            Megaphones
                          </span>
                        </div>
                      ))}
                    </Tab>
                  </li>
                  <li className='FancyTabs-tablistItem'>
                    <Tab id='t3' className='FancyTabs-tab'>
                      {demoTab.bind(null, (
                        <div>
                          <span className='FancyTabs-tabIcon FancyTabs-tabIcon--trophy' />
                          <span className='FancyTabs-tabText'>
                            Trophies
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
                    Lorem <a href='#'>ipsum</a> dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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

function demoTab(content, tabState) {
  let cl = 'FancyTabs-tabInner';
  if (tabState.isActive) cl += ' is-active';
  return (
    <div className={cl}>
      {content}
    </div>
  );
}