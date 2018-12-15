'use strict';
import React, { Component } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import styles from './FJSONEditor.scss';

export default class FJSONEditor extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const options = { onChange: this.props.onChange };
    this._container = document.getElementById('jsonEditor');
    this._editor = new JSONEditor(this._container, options);
    this.props.editorRef(this._editor);
    this._editor.set(this.props.json);
  }

  componentWillReceiveProps(nextProps) {
    this._editor.set(nextProps.json);
  }

  render() {
    console.log(this.props.json);
    return <div id="jsonEditor" className={styles.editor}></div>;
  }
}
