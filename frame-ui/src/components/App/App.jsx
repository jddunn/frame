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

// HTML Editor
import HTMLEditor from '../HTMLEditor/HTMLEditor';

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
              <Button type="primary" 
                onClick={this.toggleCollapsed}
                style={{ top: '0', 
                        left: '0',
                        position: 'absolute',
                        display: 'block',
                        zIndex: '100',
                        opacity: '1',
                        marginLeft: '-5px'}}>
                    <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
                  </Button>
                  <MainMenu />

                    
                </Sider>
                <Layout>
                  {/* <Header style={{padding: 0 }}>Lookback</Header> */}
                  <Content>
                    <div className="center notepadContainer">
                      <div className="editorContainer">
                        <h4 className="sectionTitleText">Editor</h4>
                        <HTMLEditor/>
                      </div>
                      <div className="previewContainer">
                        <h4 className="sectionTitleText">Preview</h4>
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
