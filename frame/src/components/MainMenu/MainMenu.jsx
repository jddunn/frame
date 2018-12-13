/* 
Sidebar / main menu navigation (collapsible).
Contains the sortable tree components for Frame's entries (TODO: refactor
  this out as its own component later as it gets larger).
*/

import React, { Component } from 'react';
import Resizable from 're-resizable';

// Sortable tree component
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
// Tree component with file explorer view
import FJSONEditor from '../FJSONEditor/FJSONEditor';

// Ant Design
import { Menu, Icon, Button, ButtonGroup, Input, Divider } from 'antd';

// Local comp styles
import './MainMenu.scss';
 // When it's easier to override vendor styles 
import '../../lib/custom-vendor/react-sortable-tree-style.css';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;

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
      
      /* treeData is the current "library" of entries loaded,
          from a JSON file as specified from config, or which is
          the last library loaded by the user.
      */
      treeData: [
      ],

      /* The type of explorer in Entries 
      */
      entriesEditorUsingJson: false
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
      this.setState({treeData: treeData,
                  // jsonTreeData: this._editor.set(json),
                  jsonTreeData: treeData
      });
    } else {
      this.setState({treeData: treeData});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this._editor) {
      this.setState({treeData: this.props.Entries,
        jsonTreeData: this.props.Entries
      });  
    } else {
      this.setState({treeData: this.props.Entries,
      });  
    }
  }

  // JSONEditor funcs
  
  onChangeTreeData(treeData) {
    if (this._editor) {
      // this._editor.set(treeData);
      this.setState({treeData: this.props.Entries,
                    jsonTreeDat: this.props.Entries
      })
    }
  }

  // setNewTreeData(json) {
    // if (this._editor) {
      // this.setState({
        // treeData: this._editor.set(json),
      // });
    // }
  // }

  getNewTreeData() {
    if (this._editor) {
      this.setState({
        treeData: this._editor.get(),
        jsonTreeData: this._editor.get()
      });
    }
  }

  editorRef(editor) {
    this._editor = editor;
  }

  expand(expanded) {
    const newTreeData = toggleExpandedForAll({
      treeData: this.state.treeData,
      jsonTreeData: this.state.jsonTreeData,
      expanded,
    });


    if (this._editor) {
      this.setState({
        treeData: newTreeData,
        jsonTreeData: newTreeData
      });
      // this._editor.set(newTreeData);
    };


  }


  // SortableTree funcs

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  updateTreeData(treeData) {
    this.setState({ treeData: treeData, jsonTreeData: treeData });
  }

  expand(expanded) {
    this.setState(prevState => ({
      jsonTreeData: this.state.treeData,
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

  handleSwitchEntriesEditorType = (event) => {
    const val = event.target.key;
    this.setState((prevState, props) => ({
      entriesEditorUsingJson: !prevState.entriesEditorUsingJson,
    }));
  }

  render() {
    
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state;
    
    const { onChangeTreeData } = this.props;
    const isTreeCollapsed = this.state.isTreeCollapsed;
    const show = (isTreeCollapsed == true) ? true: false;
    const treeHeight = (foundEntries == true) ? '260px' : '50px';

    let treeLength;
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
    if (entriesEditorUsingJson) {
      entriesEditorButtonType = 'edit';
    } else {
      entriesEditorButtonType = 'browse';
    }





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
                    type="primary"
                    ghost={true} 
                    disabled={!searchFoundCount}
                    onClick={this.selectPrevMatch}
                  >
                    <Icon size="small" type="left" />
                  </Button>
                  <Button
                    className="searchArrowButton"
                    type="primary"
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
                  {' / '}
                  {searchFoundCount || 0}
              </span>

              <div className="entriesEditorButtonsContainer">
                <div className="mainEntriesButtonsWrapper">
                  <div className="primaryGhostButton"
                        style={{display: 'inline'}}>
                  <Button 
                    className="primaryGhostButton"
                    type="primary"
                    ghost={true}
                    icon="file-add"
                    className="textButton"
                    >
                    Start New
                    </Button>
                  </div>
                  <div className="primaryGhostButton"
                        style={{display: 'inline'}}>
                  <Button 
                    type="primary"
                    ghost={true} 
                    icon="edit"
                    onClick={this.handleSwitchEntriesEditorType}
                    // onClick={() => {this.handleSwitchEntriesEditorType}}
                    className="textButton"
                    >
                    {entriesEditorButtonType.charAt(0).toUpperCase() +
                                    entriesEditorButtonType.slice(1) + ' ' 
                                    + ' Data'}
                  </Button>
                  </div>
                </div>
                <div className="expandEntriesButtonsWrapper">
                  <Button 
                    shape="circle" 
                    ghost={true}
                    className="smallButton"
                    icon="plus"
                    onClick={this.expandAll}
                    />
                  <Button
                    shape="circle" 
                    ghost={true}
                    className="smallButton" 
                    icon="minus" onClick={this.collapseAll}
                    />
                </div>
              </div>
          </div>
          {/* Start sortable tree comp for entries */}
          <div className="treesEntriesContainer">
              {entriesEditorUsingJson ? (
                <React.Fragment>
                <FJSONEditor onChange={this.getNewTreeData} editorref={this.editorRef} Entries={this.state.Entries}/>
                </React.Fragment>
              ) : (
                <div>
                    <SortableTree
                    // theme={CustomTheme}
                    treeData={treeData}
                    onChange={this.updateTreeData}
                    searchQuery={searchString}
                    searchFocusOffset={searchFocusIndex}
                    style={
                            {
                              forceSubMenuRender: true,
                              inlineCollapsed: true,
                              minWidth: '180px',
                              height: treeHeight,
                              backgroundColor: 'transparent',
                              background: 'transparent',
                              color: 'grey',
                            }
                          }
                    // rowHeight={45}
                    searchFinishCallback={matches =>
                      this.setState({
                        searchFoundCount: matches.length,
                        searchFocusIndex:
                          matches.length > 0 ? searchFocusIndex % matches.length : 0,
                      })
                    }
                    canDrag={({ node }) => !node.dragDisabled}
                    generateNodeProps={rowInfo => ({
                      buttons: [
                        <button onClick={() => alertNodeInfo(rowInfo)}>i</button>,
                      ],
                    })}
                    />
                    <div className="footerContainer">
                      <p className="footerNoteText" style={{float: 'right', marginTop: '-10px', marginRight: '5px'}}>
                        {treeLength + ' entries recorded'}
                      </p>
                    </div>
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
