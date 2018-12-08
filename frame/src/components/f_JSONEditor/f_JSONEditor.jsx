import React, { Component } from 'react';
import JSONEditor from 'jsoneditor';
import styles from './f_JSONEditor.scss';

export default class f_JSONEditor extends Component {
  componentDidMount() {
    const options = { onChange: this.props.onChange };
    this._container = document.getElementById('jsonEditor');

    this._editor = new f_JSONEditor(this._container, options);

    this.props.editorRef(this._editor);
  }

  render() {
    return <div id="jsonEditor" className={styles.editor} />;
  }
}
