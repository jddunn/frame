'use strict';
import config from '../../data/config.json';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider, Form, Input
  } from 'antd';

import Clock from 'react-live-clock';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import './Home.scss';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;

import { Group } from '@vx/group';
import { Tree } from '@vx/hierarchy';
import { LinkHorizontal } from '@vx/shape';
import { hierarchy } from 'd3-hierarchy';
import { LinearGradient } from '@vx/gradient';
import SearchLibrary from '../SearchLibrary/SearchLibrary.jsx';
import VisualizeLibrary from '../VisualizeLibrary/VisualizeLibrary.jsx';

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
const bg = '#272b4d';

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _isMounted: false,
      Entries: []
    };
  }
  
  componentDidMount() {
    this.setState({_isMounted: true, Entries: this.props.Entries});
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({entry: nextProps.entry, Entries: nextProps.Entries});
  }

  render() {

    const entriesObj = {"title": "Entries",
                        "children": this.state.Entries
    };

    const data = hierarchy(entriesObj);
    const width = 1280;
    const height = 800;
    const yMax = width/1.5;
    const xMax = height/1.5;

    const entryTextToSummarize = "";

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    };

    return (
      <div className="homeWrapper">
        <div className="datetime">
          <div className="timeContainer">
            <Clock
              format={'ddd, h:mm A'}
              ticking={true}
              />
          </div>
          <div className="dateContainer">
            <Clock
              format={'MMMM DD, YYYY'}
              ticking={true}
              />
            </div>
        </div>
        {/* <Row> */}
          {/* <Col span={18}> */}
            {/* <div className="libraryOverview">
              <Collapse bordered={false} defaultActiveKey={['1']} className="collapseTransparent">
                <Panel header="Library Overview" key="1" style={customPanelStyle}>
                  <h4 className="libraryOverviewText">You've done this</h4>
                </Panel>
              </Collapse>
            </div> */}
          {/* </Col> */}
        {/* </Row> */}
        <Row>
        <Col span={18}>
            <div className="askInput">
              <SearchLibrary Entries={this.state.Entries}  updateAppMethod={this.props.updateAppMethod}/>
            </div>
          </Col>
          </Row>
          <Row>
          <Col span={18}>
          <div className="entriesChart">
              <VisualizeLibrary Entries={this.state.Entries}/>
            </div>
            </Col>
          </Row>
        </div>
    );
  }
}

function Node({ node }) {
  const width = 100;
  const height = 50;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children;
  if (isRoot) return <RootNode node={node} />;
  if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={bg}
        stroke={green}
        strokeWidth={1}
        strokeDasharray={'2,2'}
        strokeOpacity={0.6}
        style={{ pointerEvents: 'cursor' }}
        rx={50}
        onClick={() => {
          setState("entryId", node.data.id);
          message.info("Selecting entry: " + '"' + node.data.title + '"' +
           ". Open the Look or Analyze tab to see your selected entry.", 1.0);
          // alert(`clicked: ${JSON.stringify(node.data.title)}`);
        }}
      />
      <text
        dy={'.33em'}
        fontSize={12}
        // fontFamily="Arial"
        textAnchor={'middle'}
        fill={green}
        onClick={() => {
          setState("entryId", node.data.id);
          message.info("Selecting entry: " + '"' + node.data.title + '"' +
           ". Open the Look or Analyze tab to see your selected entry.", 1.0);
          // alert(`clicked: ${JSON.stringify(node.data.title)}`);
        }}
      >
        {node.data.title}
      </text>
    </Group>
  );
}

export function RootNode({ node }) {
  return (
    <Group top={node.x} left={node.y + 50}
    >
      <circle r={36} fill="url('#lg')" />
      <text
        dy={'.33em'}
        fontSize={12}
        // fontFamily="Arial"
        textAnchor={'middle'}
        style={{ pointerEvents: 'pointer' }}
        fill={plum}
      >
        {node.data.title}
      </text>
    </Group>
  );
}

export function ParentNode({ node }) {
  const width = 100;
  const height = 50;
  const centerX = -width / 2;
  const centerY = -height / 2;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={bg}
        stroke={blue}
        strokeWidth={1}
        onClick={() => {
          setState("entryId", node.data.id);
          message.info("Selecting entry: " + '"' + node.data.title + '"' +
           ". Open the Look or Analyze tab to see your selected entry.", 1.0);
          // alert(`clicked: ${JSON.stringify(node.data.title)}`);
        }}
      />
      <text
        dy={'.33em'}
        fontSize={15}
        // fontFamily="Arial"
        textAnchor={'middle'}
        style={{ pointerEvents: 'pointer' }}
        fill={blue}
        onClick={() => {
          setState("entryId", node.data.id);
          message.info("Selecting entry: " + '"' + node.data.title + '"' +
           ". Open the Look or Analyze tab to see your selected entry.", 1.0);
          // alert(`clicked: ${JSON.stringify(node.data.title)}`);
        }}
      >
        {node.data.title}
      </text>
    </Group>
  );
}