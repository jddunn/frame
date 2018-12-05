import React, { Component } from 'react';

import Resizable from 're-resizable';

// Sortable tree component
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
// Sortable tree custom theme
// import CustomTheme from '../../index';

// Ant Design
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'
import { Menu, Icon, Button } from 'antd';

// Local styles
import './react-sortable-tree-style.css' // For local changes
import './MainMenu.css';

const SubMenu = Menu.SubMenu;

class MainMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      divStyle: {width: 330, fontSize: '1.05vw !important'},
      width: 330, 
      height: 330,
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: [
        { title: 'This is the Full Node Drag theme' },
        { title: 'You can click anywhere on the node to drag it' },
        {
          title: 'This node has dragging disabled',
          subtitle: 'Note how the hover behavior is different',
          dragDisabled: true,
        },
        { title: 'Chicken', children: [{ title: 'Egg' }] },
      ],
    };
    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
  }

  toggleCollapsed = () => {
    if (this.state.collapsed) {
      this.state.divStyle['width'] = 330;
      this.state.divStyle['fontSize'] = '1.05vw !important';
    } else {
      this.state.divStyle['width'] = 80;
      this.state.divStyle['fontSize'] = '1vw !important';
    }
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

            {/* Start sidebar menu comp */}

            <div>
              <Button type="primary" 
                onClick={this.toggleCollapsed}
                style={{ top: '0', 
                        left: '0',
                        position: 'absolute',
                        display: 'block'}}>
                <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
              </Button>
            </div>
            <br></br>
            <Menu
              className="mainMenuContainer"
              style={{
                margin: '0 !important',
                padding: '0 !important',
                top: '0 !important',
                left: '0 !important',
                float: 'left',
                width: this.state.divStyle.width
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
            
                <Resizable
                  size={{ width: this.state.width, height: this.state.height }}
                  onResizeStop={(e, direction, ref, d) => {
                    this.setState({
                      width: this.state.width + d.width,
                      height: this.state.height + d.height,
                    });
                  }}
                >
                <div style={{ flex: '1 0 50%', padding: '0 0 0 15px' }}>
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
                                    height: '800px',
                                    backgroundColor: 'transparent',
                                    background: 'transparent',
                                    color: 'grey',
                                    fontSize: this.state.divStyle.fontSize,
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
                        )}
                      </div>
                    )}
                  </div>
                </Resizable>
          </SubMenu>
              <Menu.Item key="5">
                <Icon type="inbox" />
                <span>Ask</span>
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

 