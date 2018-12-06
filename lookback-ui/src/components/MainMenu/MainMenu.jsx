import React, { Component } from 'react';

import Resizable from 're-resizable';

// Sortable tree component
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
// Sortable tree custom theme
// import CustomTheme from '../../index';

// Ant Design
import '../../lib/antd.css';  
import { Menu, Icon, Button } from 'antd';

// Local styles
import '../../lib/react-sortable-tree-style.css' // For local changes
import './MainMenu.css';

const SubMenu = Menu.SubMenu;

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
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
        .join(',\n   ');

      global.alert(
        'Info passed to the icon and button generators:\n\n' +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(', ')}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });


    const isCollapsed = this.state.isCollapsed;

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
        <Menu.Item key="1">
          <Icon type="desktop" />
          <span>Look</span>
        </Menu.Item>
      
        <SubMenu key="sub2" title={<span><Icon type="snippets"/><span>Entries</span></span>}>
      
          <React.Fragment>
              {isCollapsed ? (
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
                              maxHeight: '400px',
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

 