import React, { Component } from 'react';

import Resizable from 're-resizable';

// Sortable tree component
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
// Sortable tree custom theme
// import CustomTheme from '../../index';

// Ant Design
import '../../lib/antd.css';  
import { Menu, Icon, Button, ButtonGroup } from 'antd';

import { Input } from 'antd';
import { Divider } from 'antd';

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
        {
          title: 'Most recent node is always here',
          subtitle: 'Note how the hover behavior is different',
          data: {}
          // dragDisabled: true,
        },
        { title: 'This is the Full Node Drag theme', data: {}},
        { title: 'You can click anywhere on the node to drag it', data: {} },
        { title: 'Chicken', children: [{ title: 'Egg', data: {} }], data: {} },
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
    alert("MENU CHANGE");
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
    
    let showFooter = false;
    if (isTreeCollapsed) {
      alert("hey");

      showFooter = true;
    } else {
      showFooter = false;
    }

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
        

        <SubMenu
      


        key="sub2" title={<span
        
        ><Icon 
      
        type="snippets"/>
        <span 

        >Entries</span></span>}>
      
          <Divider />

          <div className="entriesButtonsContainer">

              <Search
                    id="findBox"
                    value={searchString}
                    placeholder="Search entries"
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
                    <Icon 
                      size="small"
                      type="left" />
                  </Button>
                  <Button
                    className="searchArrowButton"
                    type="primary"
                    ghost={true} 
                    disabled={!searchFoundCount}
                    onClick={this.selectNextMatch}
                  >                  
                    <Icon
                      size="small"
                      type="right" />
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
                  <Button type="primary" ghost={true} icon="file-add" className="textButton">Start New</Button>
                  <Button type="primary" ghost={true} icon="save" className="textButton">Save Changes</Button>
                </div>
                <div className="expandEntriesButtonsWrapper">
                  <Button shape="circle" ghost={true} className="smallButton" icon="plus" onClick={this.expandAll}/>
                  <Button shape="circle" ghost={true} className="smallButton" icon="minus" onClick={this.collapseAll}/>
                </div>
              </div>
        
        </div>

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
                              height: '260px',
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
      

      {/* End menu comp */}

    </React.Fragment>
    );
  }
}

export default MainMenu;