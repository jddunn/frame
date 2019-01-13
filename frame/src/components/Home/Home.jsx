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

/**
 * TODO: Eventually separate out the summarizer too and other analysis components,
 * since this class is getting massive.
 */

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import ReactJson from 'react-json-view';

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import './Home.scss';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;
export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _isMounted: false,
    };
  }
  
  componentDidMount() {
    this.setState({_isMounted: true});
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  render() {
    return (
      <div className="brandContainer">
      Homeasdasd
      </div>
    );
  }
}
