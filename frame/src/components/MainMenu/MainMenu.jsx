'use strict';
import React, { Component } from 'react';
import Resizable from 're-resizable';

/** Sortable tree component */
import SortableTree,
 { toggleExpandedForAll,
    addNodeUnderParent,
    removeNodeAtPath } from 'react-sortable-tree';
/** Tree component with file explorer view */
import FJSONEditor from '../FJSONEditor/FJSONEditor';

import { EntryCreate } from '../EntryCreate/EntryCreate';

/** Ant Design */
import { Menu, Icon, Button, ButtonGroup, Input, Divider
 } from 'antd';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'

/** React-sortable-tree has so many style classes it'll be easier 
 *  to overwrite some of them here 
 */  
import '../../lib/custom-vendor/react-sortable-tree-style.css';

/** Local comp style */
import './MainMenu.scss';

import { getTimestamp } from '../../utils/get-timestamp';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;

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

      addAsFirstChild: false,
      
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
      visible: false
    };
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
    // For entry create modal
  }

  componentDidMount() {
    let treeData = [];
    try {
      if (this.props.Entries.length > 0) {
        treeData = this.props.Entries;
        console.log("Tree data found: ", treeData);
      }
    } catch (err) {
    }
    if (this._editor) {
      this._editor.set(treeData);
      this._editor.expandAll();
      this.setState({treeData: treeData
      });
    } else {
      this.setState({treeData: treeData});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this._editor) {
      this._editor.set(nextProps.Entries);
      this.setState({treeData: nextProps.Entries
      });  
    } else {
      this.setState({treeData: nextProps.Entries,
      });  
    }
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

  // setNewTreeData(json) {
    // if (this._editor) {
      // this.setState({
        // treeData: this._editor.set(json),
      // });
    // }
  // }

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

  // Handles switching the type of Notebook editor
  handleSwitchEntriesEditorType = (event) => {
    const val = event.target.key;
    this.setState((prevState, props) => ({
      entriesEditorUsingJson: !prevState.entriesEditorUsingJson,
    }));
  }

  alertNodeInfo = ({ node, path, treeIndex }) => {
    const objectString = Object.keys(node)
      .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
      .join(',\n   ');
  
    global.alert(
        `{\n   ${objectString}\n},\n`
        // `path: [${path.join(', ')}],\n` +
        // `treeIndex: ${treeIndex}`
    );
  };


  // Create a new entry with modal form

  showModal = () => {
    this.setState({ visible: true });
  }

  handleCancel = () => {
    alert("NO");
    this.setState({ visible: false });
  }

  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      console.log('Received values of form: ', values);
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
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

    let treeLength;
    // TODO: Eventually we must convert the nested tree to a flat 
    // tree to get the full number of entries in a library.
    // Currently this only counts the parent-level nodes.
    try {
      treeLength = this.state.treeData.length;
      if (typeof(treeLength) === 'undefined') treeLength = 0;
    } catch(err) {
      treeLength = 0;
    }

    let foundEntries;
    try {
      foundEntries = (this.state.treeData.length > 0) ? true : false;
    } catch (err) {
      console.log("Could not find entries");
      foundEntries = false;
    }
    
    const entriesSearchPlaceholderText = (foundEntries == true) ? 'Search entries..' : 'No entries written';
    const entriesEditorUsingJson = this.state.entriesEditorUsingJson;
    let entriesEditorButtonType;
    if (!entriesEditorUsingJson) {
      entriesEditorButtonType = 'edit';
    } else {
      entriesEditorButtonType = 'browse';
    }
    console.log(this.state.visible);
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
          defaultSelectedKeys={['sub2']}
          defaultOpenKeys={['sub2']}
          mode="inline"
          theme="dark"
          inlineCollapsed={this.state.collapsed}
        >

          <Menu.Item key="1" style={{marginTop: '20px'}}>
            <Icon type="desktop" />
            <span>Look</span>
          </Menu.Item>

            <SubMenu key="sub2" title={<span><Icon type="snippets"/>
              <span>Entries</span></span>}>
              <Divider />
                <div className="entriesEditorButtonsContainer">
                  <div className="mainEntriesButtonsWrapper">

                        <EntryCreate/>
                    <div className="primaryGhostButton"
                      style={{display: 'inline'}}>
                      <Button 
                        type="primary"
                        ghost={true} 
                        icon="edit"
                        onClick={this.handleSwitchEntriesEditorType}
                        className="textButton"
                        >
                        {entriesEditorButtonType.charAt(0).toUpperCase() +
                          entriesEditorButtonType.slice(1) + ' ' 
                          + ''}
                      </Button>
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
                    <div className="searchArrowButtonsContainer">
                      <Button
                        className="searchArrowButton"
                        // type="primary"
                        shape="circle" 
                        ghost={true} 
                        disabled={!searchFoundCount}
                        onClick={this.selectPrevMatch}
                      >
                        <Icon size="small" type="left" />
                      </Button>
                      <Button
                        className="searchArrowButton"
                        // type="primary"
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
                        buttons: [
                          <Button
                            shape="circle" 
                            ghost={true}
                            className="rowContentsToolbarIcon"
                            onClick={() => this.alertNodeInfo(rowInfo)}
                            >
                              <Icon size="small" type="left" />
                          </Button>,

                          <Button
                            shape="circle" 
                            ghost={true}
                            className="rowContentsToolbarButtonPlus"
                            onClick={() =>
                              this.setState(state => ({
                                treeData: addNodeUnderParent({
                                  treeData: state.treeData,
                                  parentKey: rowInfo.path[rowInfo.path.length - 1],
                                  expandParent: true,
                                  getNodeKey: getNodeKey,
                                  newNode: {
                                    title: `New entry`,
                                  },
                                  addAsFirstChild: state.addAsFirstChild,
                                }).treeData,
                              }))
                            }                  
                            >
                              <Icon size="small" type="plus" />
                          </Button>,

                          <Button
                            shape="circle" 
                            ghost={true}
                            className="rowContentsToolbarButtonMinus"
                            onClick={() =>
                              this.setState(state => ({
                                treeData: removeNodeAtPath({
                                  treeData: state.treeData,
                                  path: rowInfo.path,
                                  getNodeKey: getNodeKey
                                }),
                              }))
                            }
                            >
                              <Icon size="small" type="close" />
                            </Button>,
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
                          Add more
                        </button>
                        <label htmlFor="addAsFirstChild">
                          Add new nodes at start
                          <input
                            name="addAsFirstChild"
                            type="checkbox"
                            checked={this.state.addAsFirstChild}
                            onChange={() =>
                              this.setState(state => ({
                                addAsFirstChild: !state.addAsFirstChild,
                              }))
                            }
                          />
                        </label> */}
                  </div>
                )}
              </div>
              {/* End sortable tree */}
            <Divider />
          </SubMenu>
          <Menu.Item key="5">
            <Icon type="inbox" />
            <span>Ask</span>
          </Menu.Item>
          <Menu.Item key="6">
            <Icon type="inbox" />
            <span>Summaries</span>
          </Menu.Item>
          <SubMenu key="sub3" title={<span><Icon type="appstore" /><span>Settings</span></span>}>
            <Menu.Item>Visual</Menu.Item>
            <Menu.Item>Online</Menu.Item>
            <Menu.Item>Security</Menu.Item>
            <Menu.Item>About</Menu.Item>
          </SubMenu>
        </Menu>
        {/* End main menu comp */}
    </React.Fragment>
    );
  }
}

