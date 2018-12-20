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
// localforage.clear();

/** Notebook editors types */
const editorTypes = Object.freeze(
  {
    FLOW: "flow", // Dante Editor
    FULL: "full", // Quilljs (react-quill-js)
    CODE: "code", // Monaco Editor (VS Studio base)
    EQUATION: "equation" // Unknown? But needs to 
                         // include interactive calculator
  });

const { Header, Content, Footer, Sider } = Layout;

/**
 * Main app component of Frame. The app is *collapsed*
 * when the main menu is collapsed on the side.
 */
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      Entries: [],
    }
    this.handleEditorSwitchClick = this.handleEditorSwitchClick.bind(this);
    // Initial load entries from db (this func is only called on componentWillMount)
    this.getEntriesInitial = this.getEntriesInitial.bind(this);
    // Load entries async from db
    this.getEntries = this.getEntries.bind(this);
    // Update entries (this func is passed in props to child comps)
    this.updateEntries = this.updateEntries.bind(this);
    // Save content in Notebook comp to db
    this.saveNotebookData = this.saveNotebookData.bind(this);
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
    console.log(collapsed);
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

  /**
   * Handles the dropdown select menu to switch editor modes.
   * *this.state.editorType* is passed to Notepad props.
   *
   * @event {event} object
   * @public
   */
  handleEditorSwitchClick = async (event) => {
    setState("editorType", event.key.toString());
    const library = getState("library");
    const Library = openDB(library);
    const entryId = getState("entryId");
    await this.getEntries(Library, "entries").then(async(result) => {
      const Entries = result;
      const entry = traverseEntriesById(entryId, Entries);
      try {
        entry.editorType = event.key.toString();
      } catch (err) {
        entry.editorType = "flow";
      }
      if (entry != null) {
        const newEntries = replaceEntry(entry, Entries);
        this.setState({Entries: newEntries})
      }
    });
    this.forceUpdate();
  }

  saveNotebookData() {
    const Entries = this.state.Entries;
    const library = getState("library");
    const Library = openDB(library);
    saveToDB(Library, "entries", Entries).then(function(result) {
      console.log("Saved notebook data changes");
      message.success('Saved notebook changes!');
      this.forceUpdate();      
    }).catch(function(err) {
      message.fail("Failed to create new library entry!");
      this.forceUpdate();
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
        console.log("GOT NEW ENTRY: ", Entries.length);
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
    this.forceUpdate();
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
      <Menu.Item key="full">
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

  render() {
    console.log("APP UPDATE AGAIN");
    // By default editor mode for notes is Flow
    const Entries = this.state.Entries;
    let entryId = (getState("entryId") != null) ?
      getState("entryId") : null;
    let entry = traverseEntriesById(entryId, Entries);
    if (entry === null) {
      console.log("Could not find entry with ID: ", entryId);
      console.log("Setting default entry to top in tree");
      entry = Entries[0];
      try {
        setState("entryId", entry['id']);
      } catch (err) {
        setState("entryId", null);
      }
      try {
        setState("editorType", entry['editorType']);
      } catch (err) {
        setState("editorType", null);
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
    return (
      <div style={{ 
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        margin: 0 }}>
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
                <div className="center notepadContainer">
                  <br></br>
                  {/* App title */}
                  <div className="titleWrapper">
                    <h4 className="sectionTitleText">
                      {entryPageTitle}
                    </h4>
                    <div className="notebookSwitch">
                      <Tooltip 
                        placement="left"
                        overlayStyle={{width: '180px', opacity: '.95'}}
                        title=
                          {"Switch editor mode (this changes the document format)"}
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
                    </div>
                    {/* End app title */}
                    <div className="editorWrapper">
                      <div id="editor">
                          <Notepad editorType={editorType} updateAppMethod={this.updateApp}/>
                      </div>
                    </div>
                  </div>
                </Content>
              </Layout>
            </Layout>
          </div>
        );
    }
}