'use strict';
/* eslint no-named-as-default-member: 0 */
/** Global config file for app settings; TODO: Needs integrating */
import config from '../../data/config.json';
import exampleEntries from '../../data/libraries_collections/default.json'; // Example Frame library
import React, { Component } from 'react';
import {
         Row, Col, Layout, Menu, Breadcrumb,
         Icon, Button, Switch, Dropdown, message,
         Tooltip
         } from 'antd';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'
/** Menu with sortable tree component */
import MainMenu from '../MainMenu/MainMenu';
/** Notebook / Editor */
import Notepad from '../Notepad/Notepad';

/** Analysis / chatbot interface component */
import Analyzer from '../Analyzer/Analyzer';

/** Branding for logo / nav */
import Brand from '../Brand/Brand';
/** App global comp styles */
import './App.scss';
/** Persistent data storage (localForage right now) */
import localforage from 'localforage';
import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';
import {getHTMLFromContent,
  getContentFromHTML,
  HTMLToText} from '../../utils/translate-html';
/** State management with session storage.
 *  This is used to pass state vals across React components,
 *  in lieu of passing props or using Redux / Flow, for simplicity.
 */
import {setState, getState} from '../../utils/session-state';

/** Data library / source vars */
const savedSettings = config.savedSettings;
const flibsPath = savedSettings.librariesPath;
const defaultFLib = savedSettings.defaultLibrary;
const initialFLibPath = flibsPath + '/' + defaultFLib + '/' + defaultFLib + '.json';

/** LocalForage */
// localforage.clear(); // This resets the enitre db in the local Chrome app
sessionStorage.clear();

const { Header, Content, Footer, Sider } = Layout;

/**
 * Main app component of Frame. The app is *collapsed*
 * when the main menu is collapsed on the side.
 */
export default class App extends Component {
  constructor(props) {
    super(props);
    /** 
     *  The only persistent data we keep in state is Entries,
     *  so that can be modified and rendered before saving
     *  to storage.
     */
    this.state = {
      collapsed: false,
      Entries: [],
      _isMounted: false,
      // Keep track of these to see if we need to render
      // (For now these aren't necessary because we aren't focused on optimization yet)
      // prevLibrary: {},
      // prevEntryId: {},
      // prevEntryEditorType: {},
      // prevActiveLink: {}
    }
    // Initial load entries from db (this func is only called on componentWillMount)
    this.getEntriesInitial = this.getEntriesInitial.bind(this);
    // Load entries async from db
    this.getEntries = this.getEntries.bind(this);
    // Update entries (this func is passed in props to child comps)
    this.updateEntries = this.updateEntries.bind(this);
    // Update app method
    this.updateApp = this.updateApp.bind(this);

    this.sleep = this.sleep.bind(this);
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Collapse the app menu (Sider button)
   *
   * @collapsed {collapsed} bool
   * @public
   */
  onCollapse = (collapsed) => {
    // console.log(collapsed);
    this.setState({ collapsed });
  }

  /**
   * Collapse the app menu with hamburger / logo.
   *
   * @public
   */
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  async getEntries(key) {
    let Entries = [];
    // await getFromDB(Library, key).then(function(result) {
    //   Entries = result;
    // }).catch(function(err) {
    //   Entries = [];
    // });
    // Entries = getFromDB(key);
    // localforage.getItem(key).then(function(value) {
    Entries = await localforage.getItem(key);
    return Entries;
  }

  async getEntriesInitial(key) {
    let Entries = [];
    let _key = key;
    Entries = await localforage.getItem(key);
    if (Entries === null || Entries === undefined || Entries.length === 0 
      || Entries === "null") {
      Entries = await localforage.setItem(_key, exampleEntries);
      return Entries;
    } else {
      return Entries;
    }
}

  async componentDidMount() {
    let selectedEntryId = getState("entryId");
    let selectedEntryEditorType = getState("editorType");
    // let library = getState("library");
    let library = defaultFLib;
    // if (library === null || library === "null" || library === "undefined" || library === undefined) {
      // library = defaultFLib;
    // }
    const Library = openDB(library);
    let Entries = [];
    // await getFromDB(Library, key).then(function(result) {
    //   Entries = result;
    // }).catch(function(err) {
    //   Entries = [];
    // });
    Entries = await this.getEntriesInitial("entries");
    selectedEntryId = Entries[0].id;
    selectedEntryEditorType = Entries[0]['editorType'];
    setState("entryId", selectedEntryId);
    setState("editorType", selectedEntryEditorType);
    setState("activeLink", "look");
    this.setState({
      Entries: Entries,
      prevEntryId: selectedEntryId,
      prevEntryEditorType: selectedEntryEditorType,
      prevActiveLink: "look",
      prevLibrary: library,
      _isMounted: true
      });
    return Entries;
  }

  componentWillUnmount () {
    this.setState({_isMounted: false});
  }

  async updateEntries() {
    if (this.state._isMounted) {
      // let library = getState("library");
      // if (library === null || library === undefined) {
      //   library = defaultFLib;
      // }
      let selectedEntryId;
      let selectedEntryEditorType;
      const library = defaultFLib;
      const Library = openDB(library);
      let Entries = [];

      Entries = await this.getEntriesInitial("entries");
      selectedEntryId = Entries[0].id;
      try {
        selectedEntryEditorType = Entries[0]['editorType'];
      } catch (err) {
        selectedEntryEditorType = "flow"; 
      }
      setState("entryId", selectedEntryId);
        setState("editorType", selectedEntryEditorType);
        this.setState({
          Entries: Entries,
          prevLibrary: library,
          prevEntryId: selectedEntryId,
          prevEntryEditorType: selectedEntryEditorType,
          prevEntries: Entries
          }
        )
    }
  }



  // Force app to re-render; this func is passed down in props to children
  async updateApp() {
    if (this.state._isMounted) {
      // let library = getState("library");
      let library = defaultFLib;
      // if (library === null || library === undefined) {
        // library = defaultFLib;
      // }
      const Library = openDB(library);
      let Entries = [];
      let selectedEntryId = getState("entryId");
      let selectedEntryEditorType = getState("entryEditorType");
      let activeLink = getState("activeLink");
      Entries = await this.getEntriesInitial("entries");
      if (selectedEntryId != null && selectedEntryId != undefined) {
        if (selectedEntryEditorType != null && selectedEntryEditorType != undefined) {
        } else {
          selectedEntryEditorType = "flow";
        }
      } else {
        selectedEntryId = Entries[0].id;
        try {
          selectedEntryEditorType = Entries[0]['editorType'];
        } catch (err) {
          selectedEntryEditorType = "flow"; 
        }
      }
      
      setState("library", library);
      setState("editorType", selectedEntryEditorType);
      setState("entryId", selectedEntryId);
      // TODO: Make eventual optimizations below by keeping track of what needs to be re-rendered
      // Set Entries in actual React state since
      // sessionStorage can only do JSON.
      // let states = {};
      // if (this.state.prevEntryId !== selectedEntryId) {
        // if (selectedEntryId === null || selectedEntryId === undefined) {
          // states['prevEntryId'] = this.state.Entries[0].id;
          // setState("entryId", this.state.Entries[0].id);
          // try {
            // setState("editorType", this.state.Entries[0].editorType);
          // } catch (err) {
            // setState("editorType", "flow");
          // }
        // } else {
          // states['prevEntryId'] = selectedEntryId;
        // }
      // }
    //   if (this.state.prevLibrary !== library) {
    //     states['prevLibrary'] = library;
    //   }
    //   if (this.state.prevEntries !== Entries) {
    //     states['prevEntries'] = Entries;
    //     states['Entries'] = Entries;
    //   }
    //   if (this.state.prevEntryEditorType !== selectedEntryEditorType) {
    //     states['prevEntryEditorType'] = selectedEntryEditorType;
    //   }
    //   if (this.state.prevActiveLink !== activeLink) {
    //     states['prevActiveLink'] = activeLink;
    //   }
    //   if (states.length > 0) {
    //     this.setState({
    //       states
    //     });
    //   }
    }
    this.forceUpdate();
  }

  render() {
    // By default editor mode for notes is Flow
    if (this.state._isMounted) {
      const Entries = this.state.Entries;
      let entryId;
      let editorType;
      try {
        entryId = (getState("entryId") != null) ?
        getState("entryId") : Entries[0].id;
      } catch (err) {
        return null;
      }
      let entry = traverseEntriesById(entryId, Entries);

      let activeLink = getState("activeLink");
      // As we get more sections, this will eventually need
      // refactored, since a splitNotebookLayout would only
      // be true on the explore / inquire page (currently)
      // let splitNotebookLayout = activeLink === "look" ?
        // false : true;

      let splitNotebookLayout = getState("analysisDrawerVisible");
      if (entry === null) {
        // console.log("Could not find entry with ID: ", entryId);
        // console.log("Setting default entry to top in tree");
        entry = Entries[0];
        try {
          setState("entryId", entry['id']);
          entryId = entry['id'];
          editorType = entry['editorType'];
        } catch (err) {
          // console.log(err);
          message.error(err);
          setState("entryId", null);
          editorType = "flow";
        }
        try {
          setState("editorType", entry['editorType']);
          editorType = entry['editorType'];
        } catch (err) {
          setState("editorType", "flow");
          editorType = "flow";
        }
      }
      let entryPageTitle;
      try {
        entryPageTitle = (entry.title != null &&
          entry.title != undefined) ?
          entry.title : 'Notebook - ' + entry.title;
      } catch (err) {
        entryPageTitle = 'Notebook - Select "Entries > Create" to start writing';
      }
      // console.log("Passing in: ", entryId, entry, Entries);
      return (
          <React.Fragment>
            <Layout >
              <Sider
                width={350}
                trigger={null}
                collapsible
                collapsed={this.state.collapsed}
                onCollapse={this.onCollapse}
              >
            <div className="leftSide">
              <div
                className="brandWrapper"
                style={{ top: '0', 
                left: '0',
                zIndex: '100',
                opacity: '1',
                }}
                onClick={this.toggleCollapsed}>
                <Brand/>
                </div>
                  <MainMenu Entries={Entries} updateEntriesMethod={this.updateEntries}
                    updateAppMethod={this.updateApp}
                  />
              </div>
                </Sider>
              <Layout>
                <Content>
                  <div className="center mainPageContainer">
                    <div className="titleWrapper">
                      <h4 className="sectionTitleText">
                        {entryPageTitle}
                      </h4>
                    </div>
                      {/* 
                          Within the notepad, we divide the vertical layout in half
                          to show the explore / inquire content simultaneously with
                          the editor text, and both will update together in real-time. 
                      */}
                      <div className="notepadContainer">
                        <div>
                          {splitNotebookLayout ? (
                          <div className="editorWrapper">
                            <div id="editor">
                              <Notepad editorType={editorType} updateAppMethod={this.updateApp} entryId={entryId}
                                splitNotebookLayout={splitNotebookLayout} entry={entry} Entries={Entries}/>
                              <div className="analyzerWrapper">
                                <Analyzer entryId={entryId} entry={entry} Entries={Entries} updateAppMethod={this.updateApp} visibility={splitNotebookLayout}/>
                              </div>
                            </div>
                        </div>
                          ) : (
                          <div className="editorWrapper">
                            <div id="editor">
                                <Notepad editorType={editorType} updateAppMethod={this.updateApp} entryId={entryId} 
                                          splitNotebookLayout={splitNotebookLayout} entry={entry} Entries={Entries}/>
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Content>
                </Layout>
              </Layout>
            </React.Fragment>
        );
      } else {
        return null;
      }
    }
}