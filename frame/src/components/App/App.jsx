'use strict';
import config from '../../data/config.json';
import React, { Component } from 'react';
import {
         Row, Col, Layout, Menu, Breadcrumb,
         Icon, Button, Switch, Dropdown, message,
         Tooltip
         } from 'antd';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'

// Menu with sortable tree component
import MainMenu from '../MainMenu/MainMenu';
// Notebook / Editor 
import Notepad from '../Notepad/Notepad';
// Branding for logo / nav
import Brand from '../Brand/Brand';

// App global comp styles
import './App.scss';

// Lowdb
import low from 'lowdb';
import LocalStorage from 'lowdb/adapters/LocalStorage';

const { Header, Content, Footer, Sider } = Layout;

// Data library / source vars
const savedSettings = config.savedSettings;
const adapter = new LocalStorage('db');
const db = low(adapter);
const Entries = {};

db.defaults({ posts: [] })
  .write()

// Data is automatically saved to localStorage
db.get('posts')
  .push({ title: 'lowdb' })
  .write()

console.log(db);



/** Types of editors there are */
const editorTypes = Object.freeze(
  {
    FLOW: "flow", // Dante Editor
    FULL: "full", // Quilljs (react-quill-js)
    CODE: "code", // Monaco Editor (VS Studio base)
    EQUATION: "equation" // Unknown? But needs to 
                         // include interactive calculator
  });

/** Extend Storage with JSON helpers */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

/**
 * Main app component of Frame. The app is *collapsed*
 * when the main menu is collapsed on the side.
 * 
 * Currently the app gets its initial data from the very
 * first *library* found in the *libraries* folder path,
 * which is all defined within config.json in /data. 
 * 
 * If no data is found in the default library, example.json 
 * will be loaded with sample entries.
 * 
 * By design, all the I/O data will be stored as JSON. To
 * keep things simple (as we don't have too many components),
 * state management is done with passing down props, and reading
 * from sessionStorage for persistent settings. 
 */
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savedSettings: savedSettings,
      collapsed: false,
      /** Type of editor to render in notebook */
      editorType: editorTypes.INLINE,
      /** Current section / page title. */
      currPageTitle: 'Notebook', 
      /**
       * Active entry / document in Notebook 
       * By default this is the latest entry created or 
       * modified, or example content. The *entryId*
       * is automatically created by combining the entry
       * title and a timestamp of last modification.
      */
      currViewedEntryId: null,
      currViewedEntryData: {},
      showExampleEntries: false,
      showBlankEntries: false
    }
    this.handleEditorSwitchClick = this.handleEditorSwitchClick.bind(this);
  }

  /**
   * Loads a single Frame library into state
   *
   * @activeFlibId {activeFlibId} str
   * @public
   */
  loadActiveFLibData = (activeFlibId) => {
    console.log(activeFlibId);
    this.setState({ activeFlibId });
  }

  /**
   * Gets array of file paths of all Frame
   * libraries found folder path, and loads
   * into state.
   *
   * @dataPath {dataPath} str
   * @public
   */
  loadFLibsCollection = (dataPath) => {
    console.log(dataPath);
    const arrOfFLibPaths = [];
    this.setState({libraryPaths: arrOfFlibPaths});
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

  /** Handles dropdown select click */
  handleDropdownButtonClick = (event) => {}


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
  handleEditorSwitchClick = (event) => { 
    this.setState((state, props) => {
      return {editorType: event.key};
    });
  }

  componentWillMount () {
    this.setState({
      Entries: Entries,
      editorType: editorTypes.INLINE,
      }
    )
  }

  loadExampleFLib() {
    // let obj = JSON.parse(
      // fs.readFileSync(initialFLibPath));
    // console.log(obj);
    // this.setState({currViewedEntryData: obj,
                  //  currViewedEntryId: 'example'              
    // });
  }

  componentDidMount () {
    this.loadExampleFLib();
  }

  /**
   * Build menu container to hold global buttons and selects.
   * @public
   */
  editorSwitchMenu = (
    <Menu onClick={this.handleEditorSwitchClick}>
      <Menu.Item key="flow">
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Streamlined, Medium-style editor"}>
        </Tooltip>
        <Icon type="edit"/>&nbsp;
          {editorTypes.FLOW.charAt(0).toUpperCase() +
          editorTypes.FLOW.slice(1)}
      </Menu.Item>
      <Menu.Item key="full">
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Full HTML editor with word processor-like capabilities"}>
        <Icon type="form"/>&nbsp;
        </Tooltip>
        {editorTypes.FULL.charAt(0).toUpperCase() +
          editorTypes.FULL.slice(1)}
      </Menu.Item>
      <Menu.Item key="code">
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Code editor and IDE (powered by Monaco Editor)"}>
        <Icon type="appstore"/>&nbsp;
        {editorTypes.CODE.charAt(0).toUpperCase() +
          editorTypes.CODE.slice(1)}
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="equation">
        <Tooltip placement="left"
          overlayStyle={{width: '120px', opacity: '.80'}}
          title={"Editor with equations and mathematical computations"}>
        </Tooltip>
        <Icon type="calculator"/>&nbsp;
        {editorTypes.EQUATION.charAt(0).toUpperCase() +
          editorTypes.EQUATION.slice(1)}
      </Menu.Item>    
    </Menu>
  );

  render() {
    // By default editor mode for notes is Flow
    let editorType;
    editorType = ((this.state.editorType != null && 
                  this.state.editorType != undefined)
                   ? this.state.editorType : 'flow');
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
                <MainMenu Entries={this.state.Entries.entries}/>
              </Sider>
            <Layout>
              <Content>
                <div className="center notepadContainer">
                  <br></br>
                  {/* App title */}
                  <div className="titleWrapper">
                    <h4 className="sectionTitleText">
                      {this.state.currPageTitle}
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
                          onClick={this.handleDropdownButtonClick}
                          overlay={this.editorSwitchMenu}
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
                    </div>
                    {/* End app title */}
                    <div className="editorWrapper">
                      <div id="editor">
                          <Notepad editorType={this.state.editorType}/>
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


