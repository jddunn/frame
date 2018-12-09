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
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

// Draft.js to HTML (for react-draft-wysiwyg)
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Local styles
import './HTMLEditor.scss';

// const rawContentState = convertToRaw(EditorState.getCurrentContent);
// const markup = draftToHtml(
  // rawContentState, 
  // hashtagConfig, 
  // directional, 
  // customEntityTransform
// );

// const blocksFromHTML = convertFromHTML(EditorState.getCurrentContent);



class HTMLEditor extends React.Component {
    constructor (props) {
      super(props)
      this.state = { 
          fullEditorOn: {checked: false}, // Set default editor type to Dante
          // DanteEditor props
          // If !fullEditorOn, these values are used for editor
          theme: 'snow',
          width: 800,
          height: 800,
          html: '<p>Write your story..</p>',
          blocksFromHTML: {},
          content: {}
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

    componentWillMount() {
      const blocksFromHTML = htmlToDraft('<p>Write your story..</p>');
      const content = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      this.setState({ content: content, blocksFromHTML: blocksFromHTML });
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
        content: contentState,
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
      return (
        <React.Fragment>
          {!fullEditorOn ? (
            <DanteEditor
              key_commands={{ 'alt-shift': [{ key: 65, cmd: 'add-new-block' }], 'alt-cmd': [ { key: 49, cmd: 'toggle_block:header-one' }, { key: 50, cmd: 'toggle_block:header-two' }, { key: 53, cmd: 'toggle_block:blockquote' }, ], cmd: [ { key: 66, cmd: 'toggle_inline:BOLD' }, { key: 73, cmd: 'toggle_inline:ITALIC' }, { key: 75, cmd: 'insert:link' }, ], }}
              config={this.config}
              body_placeholder={this.blocksFromHTML}
              // data_storage
              //   ={{ url:path.resolve(__dirname, './dante_state_data.json'), method: 'POST', }}
              //   xhr
              //   ={{ before_handler: function() {  }, failure_handler: function(error) { }, }}
              // data_storage= {
              //   save_handler= this.saveDanteContent (editorContext, content)
              // }
            />
          ) : (
            <Editor
              // editorState={editorState}
              className="fullHTMLEditor"
              // editorState={EditorState.createWithContent(this.state.content)}
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