/* 
 * 
 */

import React, { Component } from 'react';

// Ant Design
import {Row, Col } from 'antd';
import {
  Layout, Menu, Breadcrumb, Icon, Button
} from 'antd';

// Antd is really janky to theme with new styles, let's use our own lib css
import '../../lib/antd.css';  

// Local styles
import './App.scss';

// Menu with sortable tree component
import MainMenu from '../MainMenu/MainMenu';

// HTML Editor / Preview (The Notebook component)
import HTMLEditor from '../HTMLEditor/HTMLEditor';

// Import branding for collapsible footer
import Brand from '../Brand/Brand';

const {   Header, Content, Footer, Sider } = Layout;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
    }
  }

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    
    return (

      <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'column', height: '100%', width: '100%', margin: 0 }}>
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
                  <MainMenu />
                </Sider>
                <Layout>
                  {/* <Header style={{padding: 0 }}>Frame</Header> */}
                  <Content>
                    <div className="center notepadContainer">
                        <br></br>
                        <div className="titleWrapper">
                          <h4 className="sectionTitleText">Notebook</h4>
                        </div>
                        <div className="htmlEditorWrapper">
                          <HTMLEditor/>
                        </div>
                    </div>
                  </Content>
              </Layout>
          </Layout>
        </div>
    );
  }
}

export default App;
