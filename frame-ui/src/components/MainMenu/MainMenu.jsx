/* 
Sidebar / main menu navigation (collapsible).
Contains the sortable tree components for Frame's entries (TODO: refactor
  this out as its own component later as it gets larger).
*/

import React, { Component } from 'react';
import Resizable from 're-resizable';

// Sortable tree component
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';

// Ant Design
import '../../lib/antd.css';  
import { Menu, Icon, Button, ButtonGroup, Input, Divider } from 'antd';

// Local styles
import '../../lib/react-sortable-tree-style.css' // For local changes
import './MainMenu.scss';

// Import branding for collapsible footer
import Brand from '../Brand/Brand';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;

class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      width: 330, 
      height: 330,
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      showBrand: false,
      isTreeCollapsed: false,
      treeData: [
      ],
    };
    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.selectPrevMatch = this.selectNextMatch.bind(this);
    this.selectNextMatch = this.selectNextMatch.bind(this);
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  updateTreeData(treeData) {
    this.setState({ treeData });
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

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state;
    const { onChangeTreeData } = this.props;
    const isTreeCollapsed = this.state.isTreeCollapsed;
    const showFooter = (isTreeCollapsed == true) ? true: false;
    const foundEntries = (this.state.treeData.length > 0) ? true : false;
    const treeHeight = (foundEntries == true) ? '260px' : '60px';
    const entriesSearchPlaceholderText = (foundEntries == true) ? 'Search entries..' : 'No entries written';

    return (
      <React.Fragment>     
        <div>
          {showFooter ? (
          <div
            className="footerContainer">
            HEY
            <Brand/>
          </div>
            ) : (
              null
            )}
          </div>
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
        <Menu.Item key="1">
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

              <span class="entriesIndicesFoundContainer">
                  &nbsp;
                  {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
                  {' / '}
                  {searchFoundCount || 0}
              </span>

              <div className="entriesEditorButtonsContainer">
                <div className="mainEntriesButtonsWrapper">
                  <Button 
                    type="primary"
                    ghost={true}
                    icon="file-add"
                    className="textButton"
                    >
                    Start New
                    </Button>
                  <Button 
                    type="primary"
                    ghost={true} 
                    icon="save" 
                    className="textButton"
                    >
                    Save Changes
                  </Button>
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
          <React.Fragment>
              {isTreeCollapsed ? (
                        null
              ) : (
                <div>
                    <SortableTree
                    // theme={CustomTheme}
                    className="treeEntriesContainer"
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
                </div>
              )}
            </React.Fragment>
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
        </SubMenu>
      </Menu>
      {/* End main menu comp */}
    </React.Fragment>
    );
  }
}

export default MainMenu;