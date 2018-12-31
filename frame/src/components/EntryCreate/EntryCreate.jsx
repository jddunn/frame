'use strict';
import config from '../../data/config.json';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio, Select, message,
  Tooltip, Icon
} from 'antd';

import './EntryCreate.scss';

import getTimestamp from '../../utils/get-timestamp';
import generateUUID from '../../utils/generate-uuid';

import openDB from '../../utils/create-db';
import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import traverseEntriesById from '../../utils/entries-traversal';
import {setState, getState} from '../../utils/session-state';

import
{ toggleExpandedForAll,
    addNodeUnderParent,
    insertNode,
    removeNodeAtPath } from 'react-sortable-tree';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;

const http = require('http');

import localforage from "localforage";

import { HTMLToText } from "../../utils/translate-html";


const EntryCreateForm = Form.create()(
  // eslint-disable-next-line
  class extends Component {
    constructor(props) {
      super(props);
      /*
         We build the 'subtitle' field of an entry dynamically with 
         a timestamp and from the category tags (so that the subtitle)
         can be used to search for tags and dates. Because of this,
         we need to keep track of the entryTags from the specific 
         input field with state.
      */
      this.state = {entryTags: [], entryTitle: 'New entry', entrySubtitle: '', 
                    timestamp:'', entrySubtitleTagsPlaceholder: '',
                    webLinkToExtract: ''
    };
      this.handleEditorChange = this.handleEditorChange.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleTitleInputChange = this.handleTitleInputChange.bind(this);
      this.handleTagsInputChange = this.handleTagsInputChange.bind(this);
    }
    
    handleEditorChange(value) {
      // console.log(`selected ${value}`);
    }

    handleReset() {
      this.setState({entryTitle: 'New entry', entryTags: [], entrySubtitle: '',
                        timestamp:'', entrySubtitleTagsPlaceholder: '',
                        timestamp:'', entrySubtitleTagsPlaceholder: '',
                        webLinkToExtract: ''
      });
    }

    handleTitleInputChange(event) {
      let val;
      val = event.target.value;
      const timestampNow = getTimestamp();
      this.setState({entryTitle: val, timestamp: timestampNow});
    }

    handleTagsInputChange(event) {
      let val;
      let vals = [];
      let tags = [];
      val = event.target.value.trim();
      val = val.split(/[^a-zA-Z-]+/g).filter(v=>v).join(', ');
      try {
        vals = val.split(',');
        for (let i=0; i<vals.length; i++) {
          tags.push(vals[i]);
        }
      } catch (err) {
        // console.log(err);
        tags.push(val);
      }
      let uniqueTags = [...new Set(tags)];
      const timestampNow = getTimestamp();
      const subtitleInitialText = '' + timestampNow + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
      let subtitleDefaultText = subtitleInitialText;
      if (uniqueTags.length > 0) {
        subtitleDefaultText += '[' + uniqueTags.toString() + ']';
      }
      this.setState({entryTags: uniqueTags, entrySubtitle: subtitleDefaultText, 
        entrySubtitleTagsPlaceholder: '[' + uniqueTags.toString() + ']',
        timestamp: timestampNow});
    }

    render() {
      const {
        visible, onCancel, onCreate, form,
      } = this.props;
      const { getFieldDecorator } = form;
      const uuid = generateUUID();
      const formItemLayout = {
        labelCol: { span: 9,
        },
        wrapperCol: { span: 14 }
      };
      const buttonItemLayout = {
        wrapperCol: { span: 14, offset: 2
        }
      };
      let entryTags = this.state.entryTags;
      let entryTitle = this.state.entryTitle;
      const timestampNow = getTimestamp();
      const entrySubtitle = timestampNow + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' +
                    this.state.entrySubtitleTagsPlaceholder;
      return (
        <Modal
          id="entryCreateModal"
          mask={false}
          visible={visible}
          title={entryTitle}
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <div className="entryTimestampBlock">
            <p>{timestampNow}</p>
          </div>
          <Form formLayout={"horizontal"}>
            <FormItem label="Title"
              {...formItemLayout}
              >
              {getFieldDecorator('title', {
                initialValue: 'New entry',
                rules: [{ required: true, message: 'Title of entry is required' }],
              })(
                <Input onChange={this.handleTitleInputChange}  autocomplete="off" placeholder='New entry'/>
              )}
            </FormItem>
            <FormItem label="Document Type"
                {...formItemLayout}
              >
              {getFieldDecorator('editorType', {
                  initialValue: "flow",
                  rules: [{ required: true, message: 'Document / editor format is required' }],
              })(
              <Select defaultValue="flow" style={{ width: 120 }} onChange={this.handleEditorChange}>
                <Option value="flow">Flow</Option>
                <Option value="full" disabled>Full</Option>
                <Option value="code" disabled>Code</Option>
                <Option value="equation" disabled>Equation</Option>
              </Select>
              )}
            </FormItem>

            <FormItem label="Link To Download"
              {...formItemLayout}
              >
              {getFieldDecorator('linkToExtract', {
                rules: [{ required: false}],
              })(
                <Input prefix={
                  <Tooltip title="Enter in a link / URL to automatically extract the text from for as content">                
                    <Icon type="question-circle" style={{ color: 'rgba(0,0,0,.25)' }}/>
                  </Tooltip>
                  } autocomplete="off" placeholder='http://'/>
              )}
            </FormItem>

            <FormItem label="Category Tags"
                {...formItemLayout}
              >
              {getFieldDecorator('tags', {
                initialValue: '',
              })(<Input 
                  placeholder='Separate tags by spaces and punct' type="textarea" 
                  onChange={this.handleTagsInputChange}
                  value={entryTags} 
              />)}
            </FormItem>
            <FormItem label="Description"
              {...formItemLayout}
              >
              {getFieldDecorator('subtitle', {
                  initialValue: entrySubtitle,
                  rules: [{}],
              })(<Input.TextArea 
                  disabled={true} 
                  autosize={{ minRows: 2, maxRows: 6 }}/
                  >
                  )}
            </FormItem>
            <FormItem 
              label="Unique ID"
              {...formItemLayout}
            >
            {getFieldDecorator('id', {
              initialValue: uuid,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem>
           <FormItem label="Date Created"
            {...formItemLayout}
            >
            {getFieldDecorator('dateCreated', {
              initialValue: timestampNow,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem>
            <div className="modalFooterBlock">
              <Button onClick={this.handleReset}>
                Clear
              </Button>
            </div>
            {/* <FormItem label="Date Modified"
              {...formItemLayout}
              >
              {getFieldDecorator('date created', {
                initialValue: timestampNow,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem> */}
          </Form>
        </Modal>
      );
    }
  }
);

export class EntryCreate extends Component {

  state = {
    visible: false,
  };

  showModal = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: true });
  }

  handleCancel = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: false });
  }

  refreshMenuList = () => {
    this.setState({visible: false});
  }

  handleCreate = async () => {
    const form = this.formRef.props.form;
    let m_Entries;
    var _this = this;
    form.validateFields(async (err, values) => {
      if (err) {
        message.error(err);
        return;
      }
      // console.log("FORM VALUES: ", values);
      const library = defaultFLib;
      // if (library === null || libray === undefined) {
        // library = "default";
      // }
      const m_Library = openDB(library);
      // m_Entries = getFromDB(m_Library, "entries");
      let linkToExtract = values['linkToExtract'];
      console.log("THIS IS LINK TO EXTRACT: ", linkToExtract);
      // if (linkToExtract !== null && linkToExtract !== undefined && linkToExtract !== '') {
      //   const options = {
      //     host: linkToExtract,
      //     port: 80,
      //     path: "/"
      //   };
      //   http.get(linkToExtract, function(res) {
      //     console.log("Got response: " + res.statusCode);
      //     console.log(res.text());
      //   }).on('error', function(e) {
      //     console.log("Got error: " + e.message);
      //   });

        try {
          fetch(linkToExtract,
            {
              mode: 'cors',
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              }
            }
            )
          .then(function(response) {
              // console.log("DA RESPONSE TEXT: ", response.text());
              return response.text()
          })
          .then(function(html) {
              var parser = new DOMParser();
              // Parse the text
              var doc = parser.parseFromString(html, "text/html");
              // You can now even select part of that html as you would in the regular DOM 
              // Example:
              // var docArticle = doc.querySelector('article').innerHTML;
              console.log(doc);
              values['html'] = doc;
              values['strippedText'] = HTMLToText(doc);
          })
          .catch(function(err) {  
              console.log('Failed to fetch page: ', err);  
              message.error("Unable to fetch page content from: " + linkToExtract + ' - ' + err);
          });
        } catch (err) {
          console.log(err);
          message.error("Unable to fetch page content from: " +  linkToExtract + ' - ' + err);
        }
      m_Entries = await getFromDB("entries");
      try {
        m_Entries.unshift(values);
      } catch (err) {
        // console.log(err);
        m_Entries = [];
        m_Entries.unshift(values); // Add entry to top of tree
      }
      try {
        // saveToDB(m_Library, "entries", m_Entries);
        const res = await localforage.setItem("entries", m_Entries);
        message.success("Creating new library entry..");
        form.resetFields();
        _this.props.updateEntriesMethod();        
        _this.setState({visible: false})
      } catch (err) {
        // console.log(err);
        message.error("Failed to create new library entry! " + err);
        form.resetFields();
        _this.setState({visible: false});
      }
    });
    this.setState({visible: false});
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    return (
      <div className="primaryGhostButton"
        style={{display: 'inline'}}>
        <Tooltip title="Be sure to save your changes before creating a new entry">
          <Button 
            type="primary"
            ghost={true} 
            icon="edit"
            onClick={this.showModal}
            className="textButton"
            >
            New
            </Button>
          </Tooltip>
          <EntryCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
      </div>
    );
  }
}