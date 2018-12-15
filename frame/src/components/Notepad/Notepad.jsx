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
// ReactQuill (Full text editor)
import ReactQuill, { Editor, Quill, Mixin, Toolbar } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.core.css';
// Local style
import './Notepad.scss';

// const rawContentState = convertToRaw(EditorState.getCurrentContent);
// const markup = draftToHtml(
  // rawContentState, 
  // hashtagConfig, 
  // directional, 
  // customEntityTransform
// );

// const blocksFromHTML = convertFromHTML(EditorState.getCurrentContent);
const Option = Select.Option;

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
          // editorState: EditorState.createEmpty()
        }
      this.handleChange = this.handleChange.bind(this)
      this.handleThemeChange = this.handleThemeChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
      const editorType  = nextProps.editorType;
      this.setState({ editorType: editorType });
    }

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


    // React-Quill props
    modules = {
      toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline','strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
    }
  
    formats = [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image'
    ];
  
    render () {
      const { editorState } = this.state;
      const editorType = this.state.editorType;
      let editor = {};
      switch (editorType) {
        case 'inline':
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
            break;
          case 'full':
            editor = 
            <React.Fragment>
              <ReactQuill
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
