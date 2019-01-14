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

import AskForm from '../Ask/Ask'; 

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import './SearchLibrary.scss';

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

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
const bg = '#272b4d';


export default class SearchLibrary extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _isMounted: false,
      Entries: [],
      textCorpus: "",
      textCorpusWithOrigins: {},
      selectedTagsToSearch: []
    };
  }
  
  componentDidMount() {
    this.setState({_isMounted: true, Entries: this.props.Entries});
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ Entries: nextProps.Entries});
  }

  render() {

    const entriesObj = {"title": "Entries",
                        "children": this.state.Entries
    };

    const entryTextToSummarize = "";

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    };

    const WrappedAskForm = Form.create()(AskForm);

    return (
            <div className="askInput">
            <Collapse bordered={false} defaultActiveKey={['1']} className="collapseTransparent">
                <Panel header="Ask / Search for Information" key="1" style={customPanelStyle}>
                  <WrappedAskForm entryText={entryTextToSummarize}/>
                </Panel>
              </Collapse>
            </div>
    );
  }
}