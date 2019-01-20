'use strict';
import config from '../../data/config.json';
import React, { Component } from 'react';
/** Sortable tree component */
import SortableTree,
 { toggleExpandedForAll,
    addNodeUnderParent,
    removeNodeAtPath } from 'react-sortable-tree';
import getFlatDataFromTree from '../../utils/vendor/tree-data-utils';
/** Tree component with file explorer view */
import FJSONEditor from '../FJSONEditor/FJSONEditor';
/** Modal / form input for new entry */
import { EntryCreate } from '../EntryCreate/EntryCreate';
import { EntryEditForm } from '../EntryEditForm/EntryEditForm';
/** Ant Design */
import { 
  Menu, Icon, Button, ButtonGroup,
  Input, Divider, Tooltip, message,
  Upload
 } from 'antd';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'
/** React-sortable-tree has so many style classes it'll be easier 
 *  to overwrite some of them here 
 */  
import '../../lib/custom-vendor/react-sortable-tree-style.css';
/** Local comp style */
import './MainMenu.scss';

/** Persistent data storage (localForage right now) */
import localforage from 'localforage';
import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import { traverseEntriesById,
         getEntryIdByNodeIndex,
} from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';
/** State management with session storage.
 *  This is used to pass state vals across React components,
 *  in lieu of passing props or using Redux / Flow, for simplicity.
 */
import {setState, getState} from '../../utils/session-state';

import getTimestamp from '../../utils/get-timestamp';
import generateUUID from '../../utils/generate-uuid';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const flibsPath = savedSettings.librariesPath;
const defaultFLib = savedSettings.defaultLibrary;
const initialFLibPath = flibsPath + '/' + defaultFLib + '/' + defaultFLib + '.json';


/** Main / sidebar menu for Frame. Can be hidden / collapsed
 *  with hamburger and slider icon.
 * 
 * Contains inner UI components specifically navigating and 
 * editing Frame's library's entries, and resaving the data
 * as JSON. 
 */  
export default class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false, // Hamburger collapse
      width: 330,  
      height: 330,
      /* 'Entries' section of main menu has "file explorer" UI
          The vars below need it
      */
      searchString: '', 
      searchFocusIndex: 0,
      searchFoundCount: null,
      isTreeCollapsed: false,
      addAsFirstChild: true,
      /* treeData is the current "library" of entries loaded,
          from a JSON file as specified from config, or which is
          the last library loaded by the user.
      */
      treeData: [
      ],
      /* The type of explorer in Entries 
      */
      entriesEditorUsingJson: false,
      // Showing entry modal creation form
      visible: false,
      entryEditVisible: false,
      entryIdToEdit: '',
      _isMounted: false,

    };
    // Switch menu links
    this.switchLink = this.switchLink.bind(this);
    // Node interaction
    this.clickNodeSelect = this.clickNodeSelect.bind(this);
    // react-sortable-tree func
    this.updateTreeData = this.updateTreeData.bind(this);
    // JSON Editor funcs
    this.onChangeTreeData = this.onChangeTreeData.bind(this);
    this.getNewTreeData = this.getNewTreeData.bind(this);
    this.editorRef = this.editorRef.bind(this);
    this.expand = this.expand.bind(this);
    // Expand / collapse children
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    // For search
    this.selectPrevMatch = this.selectNextMatch.bind(this);
    this.selectNextMatch = this.selectNextMatch.bind(this);
    this.handleSwitchEntriesEditorType = this.handleSwitchEntriesEditorType.bind(this);
    // Save trees to localForage
    this.saveTreeData = this.saveTreeData.bind(this);    
    // Export library to JSON
    this.exportLibraryToJSONFile = this.exportLibraryToJSONFile.bind(this);
    // Upload library JSON
    this.handleUploadFile = this.handleUploadFile.bind(this);

    this.onInlineAddClick = this.onInlineAddClick.bind(this);
  }

  async getEntries(Library, key) {
    let Entries = [];
    Entries = await getFromDB(Library, key)
    return Entries;
  }

  componentDidMount() {
    let treeData = [];
    try {
      if (this.props.Entries.length > 0) {
        treeData = this.props.Entries;
      }
    } catch (err) {
    }
    if (this._editor) {
      this._editor.set(treeData);
      this._editor.expandAll();
      this.setState({treeData: treeData,
        _isMounted: true
      });
    } else {
      this.setState({treeData: treeData,
          _isMounted: true
      });
    }
  }

  componentWillUnmount () {
    this.setState({
      _isMounted: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state._isMounted)
    if (this._editor) {
      this._editor.set(nextProps.Entries);
      this.setState({treeData: nextProps.Entries
      });  
    } else {
      this.setState({treeData: nextProps.Entries,
      });  
    }
  }

  async saveTreeData() {
    const library = getState("library");
    const Library = openDB(library);
    // saveToDB("entries", this.state.treeData);
    message.success('Saving changes in your library..');
    const res = await localforage.setItem("entries", this.state.treeData);
    // this.props.updateAppMethod();
    this.props.updateEntriesMethod();
  }

  // JSONEditor funcs
  onChangeTreeData(treeData) {
    if (this._editor) {
      this._editor.set(treeData);
      this.setState({
        treeData,
      });
    }
  }

  getNewTreeData() {
    if (this._editor) {
      this.setState({
        treeData: this._editor.get(),
      });
    }
  }

  editorRef(editor) {
    this._editor = editor;
  }

  expand(expanded) {
    const newTreeData = toggleExpandedForAll({
      treeData: this.state.treeData,
      expanded,
    });
    if (this._editor) {
      this._editor.set(newTreeData);
      this.setState({
        treeData: newTreeData,
      });
    };
  }

  // SortableTree funcs
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  updateTreeData(treeData) {
    this.setState({ treeData: treeData });
  }

  expand(expanded) {
    this.setState(prevState => ({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    }));
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }
  
  // Search SortableTree funcs
  selectPrevMatch() {
    const { searchFocusIndex, searchFoundCount } = this.state;
    this.setState({
      searchFocusIndex:
        searchFocusIndex !== null
          ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
          : searchFoundCount - 1,
    });
  }

  selectNextMatch() {
    const { searchFocusIndex, searchFoundCount } = this.state;
    this.setState({
      searchFocusIndex:
        searchFocusIndex !== null
          ? (searchFocusIndex + 1) % searchFoundCount
          : 0,
    });
  }

  function({ item, key, selectedKeys }) {
    if ((selectedKeys.includes('sub2')) || selectedKeys.includes('1')) {
      this.setState((prevState, props) => ({
        isTreeCollapsed: true
      }));
    } else {
      this.setState((prevState, props) => ({
        isTreeCollapsed: false
      }));
    }
  }

  // Handles switching the type of entries editor
  handleSwitchEntriesEditorType = (event) => {
    const val = event.target.key;
    if (!this.state.entriesEditorUsingJson) {
      alert(`Warning - You are entering an advanced, all-powerful
                 editor mode. Changing things like the id and 
                 editorType in the data could break things
                 if you don't know what you're doing!`); 
    }
    this.setState((prevState, props) => ({
      entriesEditorUsingJson: !prevState.entriesEditorUsingJson,
    }));
  }

  onInlineAddClick(rowInfo) {
    if (this.state._isMounted) {
      const getNodeKey = ({ treeIndex }) => treeIndex;
      const timestampNow = getTimestamp();
      // TODO: Make tags a default inherited value from the parent child entry
      const uuid = generateUUID();
      const newChildEntryTitle = `New entry`;
      const newChildSubtitlePlaceholderText = timestampNow;
      this.setState(state => ({
        treeData: addNodeUnderParent({
          treeData: state.treeData,
          parentKey: rowInfo.path[rowInfo.path.length - 1],
          expandParent: true,
          getNodeKey: getNodeKey,
          newNode: {
            title: newChildEntryTitle,
            subtitle: newChildSubtitlePlaceholderText,
            id: uuid,
            timestampCreated: timestampNow,
            timestampLastModified: timestampNow,
            editorType: "flow",
            tags: [],
            data: {},
            dragDisabled: false
          },
          addAsFirstChild: state.addAsFirstChild,
        }).treeData,
      })) 
    }
  }

  // Show info for node in alert
  alertNodeInfo = ({node, path, treeIndex }) => {
    console.log(event);
    event.stopPropagation(); // https://github.com/frontend-collective/react-sortable-tree/issues/74
    console.log(event.target.className);
     if (!event.target.className.includes('rowContentsToolbarIcon')) {
      return;
    }
    const objectString = Object.keys(node)
      .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
      .join(',\n   ');

    if (this.state._isMounted) {
      const Entries = this.state.treeData;
      const entryId = getEntryIdByNodeIndex(treeIndex, Entries);
      const entry = traverseEntriesById(entryId, Entries);
      // if (entryId !== null && entryId !== undefined && entryId !== "undefined") {
        this.setState({entryEditVisible: true,
                      entryIdToEdit: entryId,
                      entryValsToEdit: entry
        });
        setState("entryEditVisible", true);
      // } else {
        // message.fail("Unable to find the entry with the right ID. This could mean that entry's data has been corrupted in the database.");
      }
    // }
    // global.alert(
    //     `{\n   ${objectString}\n},\n` +
    //     // `path: [${path.join(', ')}],\n` +
    //     `treeIndex: ${treeIndex}`
    // );
  };

  clickNodeSelect(event, rowInfo) {
    // Attaching an onClick to rowInfo includes all buttons
    // within the row contents, and we want those buttons
    // to do different things than selecting the node itself.
    // setState("entryEditVisible", false);
    event.stopPropagation(); // https://github.com/frontend-collective/react-sortable-tree/issues/74
    if (event.target.className.includes('ant-btn')) {
      return;
    }
    const activeLink = getState("activeLink");
    let newActiveLink;
    if (activeLink === "main") {
      newActiveLink = "look";
    } else {
      newActiveLink = activeLink;
    }
    try {
      setState("activeLink", newActiveLink);
      message.loading('Opening "' + rowInfo.node.id + '"', .2);
      setState("entryId", rowInfo.node.id);
      setState("editorType", rowInfo.node.editorType);
      this.props.updateAppMethod();
    } catch (err) {
      // console.log(err);
      message.error('Failed to open - ' + err, 1);
    }
  }

  exportLibraryToJSONFile(library) {
    const Library = openDB(library);
    let content = {};
    let downloadLink;
    /*
       Instead of getting the data from localForage, export the
       current state of the library (so users can get exported data)
       without having to commit to the changes in the actual database
    */
   try {
      // content = JSON.stringify({"entries":
      content = JSON.stringify(this.state.treeData,
        null, 4);
      let textFileAsBlob = new Blob([content], {type:'application/json'});
      let fileNameToSaveAs = library;
      downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      if (window.URL != null) {
          // Chrome allows the link to be clicked
          // without actually adding it to the DOM.
          downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
      } else {
          // Firefox requires the link to be added to the DOM
          // before it can be clicked.
          downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
          downloadLink.onclick = document.body.removeChild(event.target);
          downloadLink.style.display = "none";
          document.body.appendChild(downloadLink);
      }
      downloadLink.click();
      message.success("Downloaded current library data!");
   } catch (err) {
    //  console.log(err);
    }
  }

  handleUploadFile = (e) => {
    // console.log("ETARGET: ", e);
    const file = e;
    const reader = new FileReader();
    // Closure to capture the file information.
    const _this = this;
    reader.onload = (function (theFile) {
      return function (e) {
        try {
          const json = JSON.parse(e.target.result);
          // console.log("JSON: ", json);
          message.success("Successfully uploaded library " + e.target);
          message.info("You will not be able to view the new library in your notebook without saving first. \
          If you want to preview contents before saving, look in the editor mode in the main menu!");
          _this.setState({treeData: json});
        } catch (err) {
          message.fail("Unable to upload new library from JSON! ", err);
          // console.log(err);
        }
      }
    })(file);
    reader.readAsText(file);
  }

  switchLink(index) {
    if (this.state._isMounted)
    switch (index) {
      case 0:
        setState("activeLink", "main");
        setState("analysisDrawerVisible", false);
        this.props.updateAppMethod();
        break;
      case 1:
        setState("activeLink", "look");
        setState("analysisDrawerVisible", false);
        this.props.updateAppMethod();
        break;
      case 5: 
        setState("activeLink", "analysis");
        setState("analysisDrawerVisible", true);
        this.props.updateAppMethod();
        break;
      case 6:
        setState("activeLink", "settings");
        setState("analysisDrawerVisible", true);
        this.props.updateAppMethod();
        break;
      default:
        // this.props.updateAppMethod();
        break;
    }
  }

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
      isTreeCollapsedsed
    } = this.state;
    const getNodeKey = ({ treeIndex }) => treeIndex;
    const { onChangeTreeData } = this.props;
    const treeHeight = (foundEntries == true) ? '260px' : '50px';
    // const library = getState("library");
    const library = defaultFLib;
    let treeLength;
    // TODO: Eventually we must convert the nested tree to a flat 
    // tree to get the full number of entries in a library.
    // Currently this only counts the parent-level nodes.
    try {
      treeLength = getFlatDataFromTree(treeData).length;
    } catch (err) {
      // console.log("Err flattening tree: ", err);
      try {
        treeLength = this.state.treeData.length;
        if (typeof(treeLength) === 'undefined') treeLength = 0;
      } catch(err) {
        treeLength = 0;
      }
    }
    let foundEntries;
    try {
      foundEntries = (this.state.treeData.length > 0) ? true : false;
    } catch (err) {
      // console.log("Could not find entries! ", err);
      foundEntries = false;
    }

    const entriesSearchPlaceholderText = (foundEntries == true) ? 'Search entries..' : 'No entries written';
    const entriesEditorUsingJson = this.state.entriesEditorUsingJson;
    let entriesEditorButtonType;
    if (!entriesEditorUsingJson) {
      entriesEditorButtonType = 'editor';
    } else {
      entriesEditorButtonType = 'browser';
    }

    const activeLink = getState("activeLink");
    const collapsed = getState("collapsed");
    let selectedKeys = [];
    let openKeys = [];
    if (!collapsed) {
      if (activeLink !== null && activeLink !== undefined && activeLink !== "undefined") {
        if (activeLink === "look") {
          selectedKeys.push('1')
          openKeys.push('sub2');
        } 
        if (activeLink === 'analysis') {
          selectedKeys.push('5');
          openKeys.push('sub2');
        }
        if (activeLink === "main") {
          selectedKeys.push('0');
          // openKeys.push('sub2');
        }
        if (activeLink === "settings") {
          selectedKeys.push('6');
          // openKeys.push('sub2');
        }
      }
    } else {
      if (activeLink !== null && activeLink !== undefined && activeLink !== "undefined") {
        if (activeLink === "look") {
          selectedKeys.push('1')
        } 
        if (activeLink === 'analysis') {
          selectedKeys.push('5');
        }
        if (activeLink === "main") {
          selectedKeys.push('0');
        }
        if (activeLink === "settings") {
          selectedKeys.push('6');
        }
    }
  }

    // Get these default vals for inline child entry creation
    const timestampNow = getTimestamp();
    // TODO: Make tags a default inherited value from the parent child entry
    const uuid = generateUUID();
    const newChildEntryTitle = `New entry`;
    const newChildSubtitlePlaceholderText = timestampNow;
    const Entries = this.state.Entries;
    // const entryEditVisible = this.state.entryEditVisible;
    const entryEditVisible = getState("entryEditVisible");
    const entryIdToEdit = this.state.entryIdToEdit;
    const entryValsToEdit = this.state.entryValsToEdit;
    console.log("ENTRY ID TO EDIT: ", entryIdToEdit, entryValsToEdit);

    if (this.state._isMounted) {
      return (
        <React.Fragment>     
          <Menu
            className="mainMenuContainer"
            style={{
              margin: '0 !important',
              padding: '0 !important',
              top: '0 !important',
              left: '0 !important',
              float: 'left',
            }}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            defaultSelectedKeys={['0']}
            // defaultSelectedKeys={['sub2', '1']}
            defaultOpenKeys={['sub2']}
            multiple={false}
            mode="inline"
            theme="dark"
            inlineCollapsed={this.state.collapsed}
          >
            <Menu.Item key="0" style={{marginTop: '20px'}}
              onClick={() => { this.switchLink(0) }}
            >
              <Tooltip title="Main search / library overview">
                <Icon type="desktop" />
              </Tooltip>
              <span>Home</span>
            </Menu.Item>

            <Menu.Item key="1" style={{}}
              onClick={() => { this.switchLink(1) }}
            >
              <Tooltip title="View / edit entries">
                <Icon type="snippets" />
              </Tooltip>
              <span>Look / Write</span>
            </Menu.Item>
              <SubMenu
                disabled={true}
                key="sub2" title={<span>
                <Tooltip title="Select, navigate, and organize entries">              
                  <Icon type="book" style={{color:'white'}}/>
                </Tooltip>
                <span style={{color: 'white'}}>Library</span></span>}
                >
                <Divider />
                  <div className="entriesEditorButtonsContainer">
                    <div className="mainEntriesButtonsWrapper">
                      <EntryCreate updateEntriesMethod={this.props.updateEntriesMethod} updateAppMethod={this.props.updateAppMethod}/>
                      <div className="primaryGhostButton"
                        style={{display: 'inline'}}>
                        <Tooltip title="Switch explorer view">
                          <Button 
                            type="primary"
                            className="saveLoadButton"
                            ghost={true} 
                            icon="menu-unfold"
                            onClick={this.handleSwitchEntriesEditorType}
                            className="textButton"
                            >
                            {entriesEditorButtonType.charAt(0).toUpperCase() +
                              entriesEditorButtonType.slice(1) + ' ' 
                            + ''}
                          </Button>
                        </Tooltip>
                      </div>
                      <EntryEdit updateEntriesMethod={this.props.updateEntriesMethod} updateAppMethod={this.props.updateAppMethod} entryEditVisible={entryEditVisible}
                                                      entryIdToEdit={entryIdToEdit} Entires={Entries} entryValsToEdit={entryValsToEdit}
                      />
                      <div className="saveLoadExportButtonsContainer">
                          <Upload beforeUpload={this.handleUploadFile} 
                            afterUpload={null} accept="json" customRequest={null}
                            showUploadList={false}
                          >
                          <Tooltip title="Upload / import an existing library (JSON)">     
                            <Button 
                                shape="circle" 
                                className="loadButton"
                                ghost={true}
                                icon="folder-open"
                                />
                            </Tooltip>
                          </Upload>
                        <Tooltip title='Export library and unsaved changes as JSON (if on desktop, add ".json" to file name)'>
                          <Button
                            shape="circle" 
                            className="exportButton"
                            ghost={true}
                            icon="export"
                            onClick={() => { this.exportLibraryToJSONFile(library) }}
                            />
                        </Tooltip>
                        <Tooltip title="Save the current library changes (not notebook)">              
                          <Button 
                            shape="circle"
                            className="saveButton"
                            ghost={true}
                            icon="save"
                            onClick={this.saveTreeData}
                            />
                        </Tooltip>
                    </div>
                  </div>
              </div>
              {/* Start sortable tree comp for entries */}
              <div className="treesEntriesContainer">
                  {entriesEditorUsingJson ? (
                    <div className="jsonEditorMainMenu">
                      <FJSONEditor json={this.state.treeData} onChange={this.getNewTreeData} editorRef={this.editorRef} />
                    </div>
                  ) : (
                    <div>
                      <div className="entriesButtonsContainer">
                        <Search
                          id="findBox"
                          value={searchString}
                          placeholder={entriesSearchPlaceholderText}
                          onChange={event =>
                            this.setState({ searchString: event.target.value })
                          }
                          style={{ width: 200 }}
                        />
                        <Button 
                          className="clearSearchButton"
                          shape="circle" 
                          ghost={true}
                          icon="close"
                          onClick={event => 
                            this.setState({searchString: ''})
                          }
                        />
                      <div className="searchArrowButtonsContainer">
                        <Button
                          className="searchArrowButton"
                          shape="circle" 
                          ghost={true} 
                          disabled={!searchFoundCount}
                          onClick={this.selectPrevMatch}
                        >
                          <Icon size="small" type="left" />
                        </Button>
                        <Button
                          className="searchArrowButton"
                          shape="circle" 
                          ghost={true} 
                          disabled={!searchFoundCount}
                          onClick={this.selectNextMatch}
                        >                  
                          <Icon size="small" type="right" />
                        </Button>
                      </div>
                      <span className="entriesIndicesFoundContainer">
                        &nbsp;
                        {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
                        {'/'}
                        {searchFoundCount || 0}
                      </span>

                      <Tooltip title="Refresh app">
                          <Button 
                            className="refreshButton"
                            shape="circle" 
                            ghost={true} 
                            icon="redo"
                            onClick={()=>{window.location.reload()}}
                            >
                            
                          </Button>
                        </Tooltip>

                  </div>
                  <div className="expandEntriesButtonsWrapper">
                    <Button 
                      shape="circle" 
                      ghost={true}
                      icon="plus"
                      onClick={this.expandAll}
                      />
                    <Button
                      shape="circle" 
                      ghost={true}
                      icon="minus" onClick={this.collapseAll}
                      />
                    </div>
                    <div>
                      <SortableTree
                        treeData={this.state.treeData}
                        onChange={this.updateTreeData}
                        searchQuery={searchString}
                        searchFocusOffset={searchFocusIndex}
                        style={
                            {
                              forceSubMenuRender: true,
                              inlineCollapsed: true,
                              height: treeHeight,
                              backgroundColor: 'transparent',
                              background: 'transparent',
                              color: 'grey',
                            }
                        }
                        searchFinishCallback={matches =>
                          this.setState({
                            searchFoundCount: matches.length,
                            searchFocusIndex:
                              matches.length > 0 ? searchFocusIndex % matches.length : 0,
                            })
                          }
                        generateNodeProps={rowInfo => ({
                          onClick: (event) => { 
                            event.stopPropagation(); // https://github.com/frontend-collective/react-sortable-tree/issues/74

                            if(event.target.className.includes('collapseButton') || event.target.className.includes('expandButton')) {
                              // Ignore the onlick, or do something different as the (+) or (-) button has been clicked.
                            }
                            else {
                              this.clickNodeSelect(event, rowInfo);
                            }
                          },
                          buttons: [
                            <Tooltip title="Edit this node / entry properties">
                            <Button
                              shape="circle" 
                              ghost={true}
                              className="rowContentsToolbarIcon"
                                onClick= {(event) => { 
                                this.alertNodeInfo(rowInfo)}         
                                }                       
                              >
                                <Icon size="small" type="left"
                                />
                            </Button>
                            </Tooltip>
                            ,
                            <Tooltip title="Add new entry inline (changes must be saved for effect)">
                            <Button
                              shape="circle" 
                              ghost={true}
                              className="rowContentsToolbarButtonPlus"
                              onClick={() => { this.onInlineAddClick(rowInfo)}}                  
                              >
                            <Icon size="small" type="plus" />
                            </Button>
                            </Tooltip>,
                            <Tooltip title="Delete entry (changes must be saved for effect)">
                            <Button
                              shape="circle" 
                              ghost={true}
                              className="rowContentsToolbarButtonMinus"
                              onClick={() =>
                                this.setState(state => ({
                                  treeData: removeNodeAtPath({
                                    treeData: state.treeData,
                                    path: rowInfo.path,
                                    getNodeKey: getNodeKey,
                                    timestampLastModified: timestampNow
                                  }),
                                }))
                              }
                              >
                                <Icon size="small" type="close" />
                              </Button>
                              </Tooltip>,
                            ],
                          })}
                        />
                        <div className="footerContainer">
                          <p className="footerNoteText" 
                            style={ 
                              { 
                                float: 'right',
                                marginTop: '-10px',
                                marginRight: '5px' 
                              } 
                            }>
                            {treeLength + ' entries recorded'}
                          </p>
                        </div>
                      </div>
                          {/* <button
                            onClick={() =>
                              this.setState(state => ({
                                treeData: state.treeData.concat({
                                  title: `New entry`,
                                }),
                              }))
                            }
                          >
                          */} 
                    </div>
                  )}
                </div>
                {/* End sortable tree */}
              <Divider />
            </SubMenu>
            <Menu.Item key="5" 
               onClick={() => { this.switchLink(5) }}
            >
              <Tooltip title="Ask questions about your library and get answers with context,
                                text summarizations, and other stats (save or select an entry to
                                run analysis)
              ">              
                <Icon type="bulb" />
              </Tooltip>
              <Tooltip title="When you select an entry, the analysis should automatically run. If it doesn't show up,
                      try saving or selecting the entry again.
              ">              
                <span>Entry Analysis</span>
              </Tooltip>
            </Menu.Item>
            <Menu.Item key="6" 
               onClick={() => { this.switchLink(6) }}
            >
              <Tooltip title="Visual, online, and security settings
              ">              
                <Icon type="inbox" />
              </Tooltip>
              <Tooltip title="When you select an entry, the analysis should automatically run. If it doesn't show up,
                      try saving or selecting the entry again.
              ">              
                <span>Settings</span>
              </Tooltip>
            </Menu.Item>
          </Menu>
          {/* End main menu comp */}
      </React.Fragment>
      );
    } else {
      return null;
    }
  }
}


export class EntryEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      _isMounted: false,
      Entries: [],
      entryId: '',
      entryVals: {}
    };
  }

  componentDidMount() {
    this.setState({
        visible: this.props.entryEditVisible,
        _isMounted: true
    });
  }

  componentWillUnmount () {
    this.setState({
      _isMounted: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state._isMounted) {
      if (this.state.entryId !== nextProps.entryId) {
        // const form = this.formRef.props.form;
        // form.resetFields();
        // const entry = traverseEntriesById(nextProps.entryIdToEdit);
        console.log("DA ENTRY EDITOR GOT ENTRY: ", nextProps);
        this.setState({visible: nextProps.entryEditVisible,
          entryVals: nextProps.entryValsToEdit,
          entryId: nextProps.entryIdToEdit,
          Entries: nextProps.Entries
        });  
      }
    }
  }

  handleCancel = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: false });
    setState("entryEditVisible", false);
  }

  refreshMenuList = () => {
    this.setState({visible: false});
    setState("entryEditVisible", false);
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  handleSave = async () => {
    const form = this.formRef.props.form;

    let m_Entries;
    var _this = this;
    form.validateFields(async (err, values) => {
      if (err) {
        message.error(err);
        return;
      }
      console.log("WE ARE SAVING: FORM VALUES: ", values)
      const library = defaultFLib;
      // if (library === null || libray === undefined) {
        // library = "default";
      // }
      const m_Library = openDB(library);
      this.setState({visible: false});
      setState("entryEditVisible", false);
      this.props.updateAppMethod();
    });
  }

  render() {
    const {entryId, entryVals, Entries } = this.state;
    const visible = getState("entryEditVisible");
    console.log("RENDER: ", entryId, entryVals);
    console.log("IS IT VISIBLE: ", visible);
    return (
      <React.Fragment>
          <EntryEditForm
            Entries={Entries}
            entryId={entryId}
            entryVals={entryVals}
            wrappedComponentRef={this.saveFormRef}
            visible={visible}
            onCancel={this.handleCancel}
            onSave={this.handleSave}
            updateAppMethod={this.props.updateAppMethod} 
          />
      </React.Fragment>
    );
  }
}
