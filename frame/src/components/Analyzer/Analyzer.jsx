'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import Resizable from 're-resizable';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select
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

    this.state = {
    };
  }

  componentDidMount() {
  }

  componentWilLReceiveProps(nextProps) {
  }

  render() {
    const entryId = getState("entryId");
    return (
        <div className="analysisContainer">
          ANALYZER on {entryId}
        </div>
    );
  }
}
