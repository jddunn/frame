/* 
HTMLEditor, using Dante2 library, which clones Mediun's interface.
So the editor itself is also a live preview of the content.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';

import DanteEditor from 'Dante2';

// Local styles
import './HTMLEditor.scss';

class HTMLEditor extends React.Component {
    constructor (props) {
      super(props)
      this.state = { editorHtml: 'Write here..', theme: 'snow', width: 800, height: 800}
      this.handleChange = this.handleChange.bind(this)
    }
    
    handleChange (html) {
        this.setState({ editorHtml: html });
    }
    
    handleThemeChange (newTheme) {
      if (newTheme === "core") newTheme = null;
      this.setState({ theme: newTheme })
    }

    handleReturn(e) {
      const { editorState } = this.state;
      if (e.shiftKey) {
        this.setState({ editorState: RichUtils.insertSoftNewline(editorState) });
      }
    }
    
    render () {
      return (
        <div>
          <DanteEditor
            key_commands={{ 'alt-shift': [{ key: 65, cmd: 'add-new-block' }], 'alt-cmd': [ { key: 49, cmd: 'toggle_block:header-one' }, { key: 50, cmd: 'toggle_block:header-two' }, { key: 53, cmd: 'toggle_block:blockquote' }, ], cmd: [ { key: 66, cmd: 'toggle_inline:BOLD' }, { key: 73, cmd: 'toggle_inline:ITALIC' }, { key: 75, cmd: 'insert:link' }, ], }}
            config={this.config}
            content={this.demo}
          />
        </div>
       )
    }
  }
  
 export default HTMLEditor;