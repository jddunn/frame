import React, { Component } from 'react';
import JSONEditor from 'jsoneditor';
import styles from './Editor.css';

export default class JSONEditor extends Component {
  componentDidMount() {
    const options = { onChange: this.props.onChange };
    this._container = document.getElementById('jsonEditor');

    this._editor = new JSONEditor(this._container, options);

    this.props.editorRef(this._editor);
  }

  render() {
    return <div id="jsonEditor" className={styles.editor} />;
  }
}
