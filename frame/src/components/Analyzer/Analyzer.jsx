'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import Resizable from 're-resizable';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, RadioGroup
  } from 'antd';

import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';
// TODO: Refactor out Editor and MEditor into different React components
import { Editor} from 'react-draft-wysiwyg'; // Full text editor
import { Editor as MEditor } from 'medium-draft'; // Medium-style text editor

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';
import styles from './Analyzer.scss';

export default class Analyzer extends Component {

  constructor(props) {
    super(props);
    this.state = { placement: 'bottom', _isMounted: false};
  }
  
  onClose = () => {
    setState("analysisDrawerVisible", false);
    console.log("Close state: ", getState("analysisDrawerVisible"));
    this.props.updateAppMethod();
    // this.setState({
      // visible: false,
    // });
  };

  onChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  }

  componentDidMount() {
    if (this.state._isMounted) {
      // const analysisDrawerVisible = getState("analysisDrawerVisible");
      // this.setState({visible: analysisDrawerVisible})
    }
  }

  componentWilLReceiveProps(nextProps) {
    if (this.state._isMounted) {
      // const analysisDrawerVisible = getState("analysisDrawerVisible");
      // this.setState({visible: analysisDrawerVisible})
    }
  }

  render() {
    const entryId = getState("entryId");
    let analysisDrawerVisible = getState("analysisDrawerVisible");

    if (analysisDrawerVisible == null || analysisDrawerVisible == undefined ||
        analysisDrawerVisible == "undefined"
    ) {
        analysisDrawerVisible = false;
    }
    return (
      <div className="analysisContainer">
        <Drawer
          title="Basic Drawer"
          mask={false}
          placement={this.state.placement}
          closable={true}
          onClose={this.onClose}
          visible={analysisDrawerVisible}
        >
          <p>
            ANALYZER on {entryId}
          </p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </div>
    );
  }
}
