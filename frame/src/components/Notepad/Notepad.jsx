'use strict';
/* 
HTMLEditor, using Dante2 library, which clones Mediun's interface.
So the editor itself is also a live preview of the content.
 */
import React, { Component } from "react";
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { Select } from 'antd';
// Dante (Medium-style editor clone) 
import DanteEditor from 'Dante2';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
// import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import {createEditorStateWithText} from 'draft-js-plugins-editor';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
// ReactQuill (Full text editor)
// import Editor from 'draft-js-plugins-editor';
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from 'draft-js-buttons';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
// import ReactQuill, { Quill, Mixin, Toolbar } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.core.css';
// Local style
import './Notepad.scss';

import 'draft-js-static-toolbar-plugin/lib/plugin.css';

// const rawContentState = convertToRaw(EditorState.getCurrentContent);
// const markup = draftToHtml(
  // rawContentState, 
  // hashtagConfig, 
  // directional, 
  // customEntityTransform
// );

// const blocksFromHTML = convertFromHTML(EditorState.getCurrentContent);
const Option = Select.Option;

const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();

// const plugins = [
//   hashtagPlugin,
//   linkifyPlugin,
// ];

// Creates an Instance. At this step, a configuration object can be passed in
// as an argument.
const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const plugins = [staticToolbarPlugin];

const editorText = "";

export default class Notepad extends Component {
    constructor (props) {
      super(props)
      this.state = { 
          // DanteEditor props
          editorType: 'inline', // Default use DanteEditor
          theme: 'snow',
          width: 800,
          editorHtml: '',
          placeholder: '<p>Write your story..</p>',
          // blocksFromHTML: {},
          content: 'content',
          editorState: createEditorStateWithText(editorText),
        }
      this.handleChange = this.handleChange.bind(this)
      this.handleThemeChange = this.handleThemeChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
      const editorType  = nextProps.editorType;
      this.setState({ editorType: editorType });
    }
    

    // draft-js
    onChange = (editorState) => {
      this.setState({
        editorState,
      });
    };
  
    focus = () => {
      this.editor.focus();
    };
  

    // Dante funcs
    handleChange (html) {
        this.setState({ editorHtml: html });
    }
    
    handleThemeChange (value) {
      console.log(value);
      this.setState({ theme: value })
    }
    
    updateContent = (value) => {
      this.setState({content:value})
    }

    // React-Quill funcs
    getInitialState = () => {
      return ({
        theme: 'snow',
        enabled: true,
        readOnly: false,
        value: EMPTY_DELTA,
        events: []
      });
    }

    formatRange = (range) => {
      return(range
        ? [range.index, range.index + range.length].join(',')
        : 'none');
    }
  
    onEditorChange = (value, data, source, editor) => {
      this.setState({
        value: editor.getContents(),
        events: [
          'text-change('+this.state.value+' -> '+value+')'
        ].concat(this.state.events)
      });
    }
  
    onEditorChangeSelection = (range, source) => {
      this.setState({
        selection: range,
        events: [
          'selection-change('+
            this.formatRange(this.state.selection)
          +' -> '+
            this.formatRange(range)
          +')'
        ].concat(this.state.events)
      });
    }
  
    onEditorFocus = (range, source) => {
      this.setState({
        events: [
          'focus('+this.formatRange(range)+')'
        ].concat(this.state.events)
      });
    }
  
    onEditorBlur = (previousRange, source) => {
      this.setState({
        events: [
          'blur('+this.formatRange(previousRange)+')'
        ].concat(this.state.events)
      });
    }
  
    onToggle = () => {
      this.setState({ enabled: !this.state.enabled });
    }
  
    onToggleReadOnly = () => {
      this.setState({ readOnly: !this.state.readOnly });
    }

    render () {
      const { editorState } = this.state;
      const editorType = this.state.editorType;
      let editor = {};
      switch (editorType) {
        case 'inline':
        editor =     
        <div className="danteEditorWrapper">
          <DanteEditor
            key_commands={
              { 
                'alt-shift': [{ key: 65, cmd: 'add-new-block' }],
                'alt-cmd': [ { key: 49, cmd: 'toggle_block:header-one' },
                { key: 50, cmd: 'toggle_block:header-two' },
                { key: 53, cmd: 'toggle_block:blockquote' }, ],
                cmd: [ { key: 66, cmd: 'toggle_inline:BOLD' }, 
                { key: 73, cmd: 'toggle_inline:ITALIC' }, 
                { key: 75, cmd: 'insert:link' }, ], 
              }
            }
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
            </div>
            break;
          case 'full':
            editor = 
            <React.Fragment>
              {/* <ReactQuill
                  style={
                    {
                      marginLeft: '-20px', 
                      marginTop: '-10px'
                    }
                  }
                  placeholder={this.state.editorPlaceholderHtml}
                  value={this.state.editorHtml}
                  theme={this.state.theme}
                  modules={this.modules}
                  formats={this.formats}
                  bounds={'.app'}
                  placeholder='Write your story'
                  onChange={this.handleChange} />
                  <div className="quillThemeSwitcher">
                      <Select 
                          style={
                            {
                              fontSize: '.85em', 
                              color: 'rgba(200, 200, 200, .95)',
                              float: 'right !important'
                            }
                          }
                          className="quillThemeSwitcher"
                          dropdownMatchSelectWidth={true}
                          defaultValue="snow"
                          onChange={this.handleThemeChange}>
                          <Option value="snow">Toolbar</Option>
                          <Option value="bubble">Inline</Option>
                      </Select>
                </div> */}
          <div className="editor" onClick={this.focus}>
            <Editor
              placeholder="Write your story"
              // editorState={this.state.editorState}
              onChange={this.onChange}
              plugins={plugins}
              ref={(element) => { this.editor = element; }}
              />
            </div>

         </React.Fragment>
            break;
          case 'code': 
            editor = null;
            break;
          case 'equation':
            editor = null;
            break;
          default:
            editor =     
            <DanteEditor
                key_commands={
                  { 
                    'alt-shift': [{ key: 65, cmd: 'add-new-block' }],
                    'alt-cmd': [ { key: 49, cmd: 'toggle_block:header-one' },
                    { key: 50, cmd: 'toggle_block:header-two' },
                    { key: 53, cmd: 'toggle_block:blockquote' }, ],
                    cmd: [ { key: 66, cmd: 'toggle_inline:BOLD' }, 
                    { key: 73, cmd: 'toggle_inline:ITALIC' }, 
                    { key: 75, cmd: 'insert:link' }, ], 
                  }
                }
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
      } 
      return (
        <React.Fragment>
          {editor}       
        </React.Fragment>
       )
    }
}



export class DraftToolbar extends Component {
  constructor (props) {
    super(props)
    this.state = { 
    }

  }

  componentWillReceiveProps(nextProps) {
  }
  

  render () {
    const { editorState } = this.state;
    const editorType = this.state.editorType;
    return (
      <React.Fragment>
      </React.Fragment>
     )
  }
}
