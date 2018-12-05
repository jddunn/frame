import React, { Component } from 'react';

// Ant Design
import {Row, Col } from 'antd';

import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'

// Local styles
import './App.css';

// Menu with sortable tree component
import MainMenu from '../MainMenu/MainMenu';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
   
  }

  render() {
  
    return (

      <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'column', height: '100%', width: '100%', margin: 0 }}>

        <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
          {/* <h3>LOOKBACK</h3> */}
        </div>

        <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
          {/* <Row style={{ margin: '0', padding: '0'}}> */}
            {/* <Col span={3} push={3} style={{ margin: '0', padding: '0'}}> */}
            <div className="left">
              <MainMenu/>
            </div>
            <div className="right">
              Very nice right
            </div>
            {/* </Col> */}
            {/* <Col span={12} push={12}/> */}
          {/* </Row> */}
        </div>
    
      </div>
    );
  }
}

export default App;
