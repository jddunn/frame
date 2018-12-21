'use strict';
/* eslint no-named-as-default-member: 0 */
/** Global config file for app settings; TODO: Needs integrating */
import config from '../../data/config.json';
import exampleEntries from '../../data/libraries_collections/example/example.json'; // Example Frame library
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
// import localforage from 'localforage';
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
      _isMounted: false
    }
    // Initial load entries from db (this func is only called on componentWillMount)
    this.getEntriesInitial = this.getEntriesInitial.bind(this);
    // Load entries async from db
    this.getEntries = this.getEntries.bind(this);
    // Update entries (this func is passed in props to child comps)
    this.updateEntries = this.updateEntries.bind(this);
    // Update app method
    this.updateApp = this.updateApp.bind(this);
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

  async getEntries(Library, key) {
    let Entries = [];
    await getFromDB(Library, key).then(function(result) {
      Entries = result;
    }).catch(function(err) {
      Entries = [];
    });
    return Entries;
  }

  async getEntriesInitial(Library, key) {
    let Entries = [];
    await getFromDB(Library, key).then(function(result) {
      Entries = result;
      let entriesCount = 0;
      try {
        entriesCount = Entries.length;
      } catch (err) {
      }
      if (entriesCount <= 0) {
        saveToDB(Library, key, exampleEntries.entries);
        this.getInitialEntries(Library, key);
      } else {
        return Entries;
      }
    }).catch(function(err) {
      Entries = [];
      return Entries;
    });
    return Entries;
  }

  componentDidMount() {
    this.setState({_isMounted: true});
  }

  componentWillUnmount () {
    this.setState({_isMounted: false});
  }

  async componentWillMount () {
    const library = defaultFLib;
    const Library = openDB(library);
    let Entries = [];
    await this.getEntriesInitial(Library, "entries").then((result) => {
      Entries = result;
      const selectedEntry = Entries[0];
      let selectedEntryEditorType;
      let selectedEntryId;
      if (selectedEntry != null && selectedEntry != undefined) {
        selectedEntryEditorType = (selectedEntry.editorType != null && 
          selectedEntry.editorType != undefined &&
          selectedEntry.editorType != "undefined" &&
          selectedEntry.editorType != "") ?
          selectedEntry.editorType : "flow"; 
          selectedEntryId = (selectedEntry.id != null && 
          selectedEntry.id != undefined &&
          selectedEntry.id != "undefined" &&
          selectedEntry.id != "") ?
          selectedEntry.id : null;
      } else {
        selectedEntryEditorType = "flow";
        selectedEntryId = null;
      }
      setState("library", library);
      setState("editorType", selectedEntryEditorType);
      setState("entryId", selectedEntryId);
      // Set Entries in actual React state since
      // sessionStorage can only do JSON.
      this.setState({
        Entries: Entries,
        }
      )
    });
  }

  async updateEntries() {
    const library = defaultFLib;
    const Library = openDB(library);
    let Entries = [];
    await this.getEntries(Library, "entries").then((result) => {
      Entries = result;
        // console.log("GOT NEW ENTRY: ", Entries.length);
        const selectedEntry = Entries[0];
        let selectedEntryEditorType;
        let selectedEntryId;
        if (selectedEntry != null && selectedEntry != undefined) {
          selectedEntryEditorType = (selectedEntry.editorType != null && 
            selectedEntry.editorType != undefined &&
            selectedEntry.editorType != "undefined" &&
            selectedEntry.editorType != "") ?
            selectedEntry.editorType : "flow"; 
            selectedEntryId = (selectedEntry.id != null && 
            selectedEntry.id != undefined &&
            selectedEntry.id != "undefined" &&
            selectedEntry.id != "") ?
            selectedEntry.id : null;
        } else {
          selectedEntryEditorType = "flow";
          selectedEntryId = null;
        }
        setState("library", library);
        setState("editorType", selectedEntryEditorType);
        setState("entryId", selectedEntryId);
        this.setState({
          Entries: Entries,
          }
        )
    });
  }

  // Force app to re-render; this func is passed down in props to children
  updateApp() {
    // const needUpdate = getState("needUpdate");
    // if (needUpdate) 
      // setState("needUpdate", false);
    if (this.state._isMounted)
    this.forceUpdate();
  }

  render() {
    // By default editor mode for notes is Flow
    const Entries = this.state.Entries;
    let entryId = (getState("entryId") != null) ?
      getState("entryId") : null;
    let entry = traverseEntriesById(entryId, Entries);
    let activeLink = getState("activeLink");

    // As we get more sections, this will eventually need
    // refactored, since a splitNotebookLayout would only
    // be true on the explore / inquire page (currently)
    console.log(getState("activeLink"));
    let splitNotebookLayout = activeLink === "look" ?
      false : true;
    if (entry === null) {
      // console.log("Could not find entry with ID: ", entryId);
      // console.log("Setting default entry to top in tree");
      entry = Entries[0];
      try {
        setState("entryId", entry['id']);
      } catch (err) {
        setState("entryId", null);
      }
      try {
        setState("editorType", entry['editorType']);
      } catch (err) {
        setState("editorType", "flow");
      }
    }
    let editorType = (getState("editorType") != null) ? 
                      getState("editorType") : "flow";
    let entryPageTitle;
    try {
      entryPageTitle = (entry.title != null &&
        entry.title != undefined) ?
        entry.title : 'Notebook - ' + entry.title;
    } catch (err) {
      entryPageTitle = 'Notebook';
    }

    console.log("Are we splitting notebook layout: ", splitNotebookLayout);
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
                              splitNotebookLayout={splitNotebookLayout}
                            />
                          </div>
                        <div className="analyzerWrapper">
                          <Analyzer entryId={entryId}/>
                        </div>
                      </div>
                        ) : (
                        <div className="editorWrapper">
                          <div id="editor">
                              <Notepad editorType={editorType} updateAppMethod={this.updateApp} entryId={entryId} 
                                        splitNotebookLayout={splitNotebookLayout}
                              />
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
    }
}