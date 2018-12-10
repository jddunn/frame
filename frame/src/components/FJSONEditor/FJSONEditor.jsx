import React, { Component } from 'react';
import JSONEditor from 'jsoneditor';
import styles from './FJSONEditor.scss';

export default class FJSONEditor extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const options = { onChange: this.props.onChange };
    this._container = document.getElementById('jsonEditor');
    this._editor = new FJSONEditor(this._container, options);
    this.props.editorref(this._editor);
    this.setState({Entries: this.props.Entries
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState((nextProps) => ({
      Entries: nextProps.Entries
    }));
  }


  render() {
    console.log(this.state);
    return <div id="jsonEditor" className={styles.editor}></div>;
  }
}
