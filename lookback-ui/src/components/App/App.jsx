import React, { Component } from 'react';



// Ant Design
import {Row, Col } from 'antd';
// Antd is really janky to theme with new styles, let's use our own lib css
import '../../lib/antd.css';  

// Local styles
import './App.css';

// Menu with sortable tree component
import MainMenu from '../MainMenu/MainMenu';

// HTML Editor
import HTMLEditor from '../HTMLEditor/HTMLEditor';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
   
  }

  render() {
  
    return (

      <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'column', height: '100%', width: '100%', margin: 0 }}>

        {/* <div style={{ flex: '0 0 auto', padding: '0 15px' }}> */}
          {/* <Row style={{ margin: '0', padding: '0'}}> */}
            {/* <Col span={3} push={3} style={{ margin: '0', padding: '0'}}> */}
            <Row>
              <Col sm={4}>
                <MainMenu/>
              </Col>
              <Col lg={8}>
                <div className="center notepadContainer">
                  <div className="editorContainer">
                    <h4 className="sectionTitleText">Editor</h4>
                    <HTMLEditor/>
                  </div>
                  <div className="previewContainer">
                    <h4 className="sectionTitleText">Preview</h4>
                  </div>
                </div> 
              </Col>   
            </Row>
            {/* </Col> */}
            {/* <Col span={12} push={12}/> */}
          {/* </Row> */}
    
      </div>
    );
  }
}

export default App;
