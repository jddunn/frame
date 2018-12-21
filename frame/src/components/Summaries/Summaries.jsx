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
import styles from './Summaries.scss';

import { parseTextForPeople } from '../../utils';

export default class Summaries extends Component {

  constructor(props) {

    super(props);

    this.state = {
      editorState: createEditorState(),
      editorEnabled: true,
      placeholder: 'Write here...',
      _isMounted: false,
      editorType: "flow"
      // uploadedImages: [],
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="brandContainer">
          <h4 className="brandTitle">F R A M E</h4> <p className="brandSubtitle">v 0.1.0</p>
      </div>
    );
  }
}
