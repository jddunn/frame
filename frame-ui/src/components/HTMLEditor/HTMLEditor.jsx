/* 
 * 
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';

// Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6
// Local styles
import './HTMLEditor.scss';

class HTMLEditor extends React.Component {
    constructor (props) {
      super(props)
      this.state = { editorHtml: 'Enter your text here..', theme: 'snow', width: 800, height: 800}
      this.handleChange = this.handleChange.bind(this)
    }
    
    handleChange (html) {
        this.setState({ editorHtml: html });
    }
    
    handleThemeChange (newTheme) {
      if (newTheme === "core") newTheme = null;
      this.setState({ theme: newTheme })
    }
    
    
    render () {
      return (
        <div>
            <ReactQuill 
                className="quillContainer"
                onChange={this.handleChange}
                value={this.state.editorHtml}
                modules={HTMLEditor.modules}
                formats={HTMLEditor.formats}
                bounds={'.app'}
                placeholder={this.props.placeholder}
            />
        {/* <div className="themeSwitcher">
                <label>Theme </label>
                <select onChange={(e) => 
                    this.handleThemeChange(e.target.value)}>
                <option value="snow">Snow</option>
                <option value="bubble">Bubble</option>
                <option value="core">Core</option>
                </select>
            </div> */}
        </div>
       )
    }
  }
  
  /* 
   * Quill modules to attach to editor
   * See https://quilljs.com/docs/modules/ for complete options
   */
  HTMLEditor.modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }], 
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }
  /* 
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
//   HTMLEditor.formats = [
//     'header', 'font', 'size', 'color', 'background',
//     'bold', 'italic', 'underline', 'strike', 'blockquote',
//     'list', 'bullet', 'indent',
//     'link', 'image', 'video'
//   ]
  
  /* 
   * PropType validation
   */
  HTMLEditor.propTypes = {
    placeholder: PropTypes.string,
  }
  
 export default HTMLEditor;