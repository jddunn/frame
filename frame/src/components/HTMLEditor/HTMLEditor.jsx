/* 
HTMLEditor, using Dante2 library, which clones Mediun's interface.
So the editor itself is also a live preview of the content.
 */
const path = require('path');

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';

// Medium-style editor clone
import DanteEditor from 'Dante2';
// Full WYSIWYG editor
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Local styles
import './HTMLEditor.scss';

class HTMLEditor extends React.Component {
    constructor (props) {
      super(props)
      this.state = { 
          fullEditorOn: {checked: false}, // Set default editor type to Dante

          // DanteEditor props
          // If !fullEditorOn, these values are used for editor
          danteContentState: {},
          theme: 'snow',

          // ContentState JSON for react-draft-wysiwyg
          // If fullEditorOn is true, this is the value used
          fullContentState: {},

          width: 800,
          height: 800,
        }
      this.handleChange = this.handleChange.bind(this)
      this.saveDanteContent = this.saveDanteContent.bind(this)
    }

    componentDidMount() {
    }
    
    componentWillReceiveProps(nextProps) {
      console.log("NEXT PROPS: ", nextProps.fullEditorOn.checked);
      const fullEditorOn  = nextProps.fullEditorOn.checked;
      console.log(fullEditorOn);
    }

    // Dante funcs
    handleChange (html) {
        this.setState({ editorHtml: html });
    }
    
    handleThemeChange (newTheme) {
      if (newTheme === "core") newTheme = null;
      this.setState({ theme: newTheme })
    }

    // react-draft-wysiwyg funcs
    onContentStateChange = (contentState) => {
      this.setState({
        contentState,
      });
    };

    
    handleReturn(e) {
      const { editorState } = this.state;
      if (e.shiftKey) {
        this.setState({ editorState: RichUtils.insertSoftNewline(editorState) });
      }
    }

    saveDanteContent(editorContext, content) {
      console.log("SAVED DANTE: ", editorContext, content);
    }
    
    render () {
      // console.log("RENDER STATE: ", this.state);
      const fullEditorOn = this.props.fullEditorOn.checked;
      console.log("FULLEDITORON: ", fullEditorOn);
      return (
        <React.Fragment>
          {!fullEditorOn ? (
            <DanteEditor
              key_commands={{ 'alt-shift': [{ key: 65, cmd: 'add-new-block' }], 'alt-cmd': [ { key: 49, cmd: 'toggle_block:header-one' }, { key: 50, cmd: 'toggle_block:header-two' }, { key: 53, cmd: 'toggle_block:blockquote' }, ], cmd: [ { key: 66, cmd: 'toggle_inline:BOLD' }, { key: 73, cmd: 'toggle_inline:ITALIC' }, { key: 75, cmd: 'insert:link' }, ], }}
              config={this.config}
              data_storage
                ={{ url:path.resolve(__dirname, './dante_state_data.json'), method: 'POST', }}
                xhr
                ={{ before_handler: function() {  }, failure_handler: function(error) { }, }}

              // data_storage= {
              //   save_handler= this.saveDanteContent (editorContext, content)
              // }
            />
          ) : (
            <Editor
              // editorState={editorState}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              onEditorStateChange={this.onEditorStateChange}
            />
            )}
        </React.Fragment>
       )
    }
  }
  
 export default HTMLEditor;