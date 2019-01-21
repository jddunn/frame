'use strict';
import config from '../../data/config.json';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio, Select, message,
  Tooltip, Icon, Divider
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

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;

const http = require('http');

import localforage from "localforage";

import { HTMLToText } from "../../utils/translate-html";

import { countSentences } from '../../lib/node-nlp-service';


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
                    linkExtractionType: 'web-extraction'
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
                        // webLinkToExtract: ''
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

    onLinkExtractionTypeChange = (event) => {
      this.setState({linkExtractionType: event.target.value});
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
                <Input onChange={this.handleTitleInputChange}  autoComplete="off" placeholder='New entry'/>
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

            <FormItem label="Category Tags"
                {...formItemLayout}
              >
              {getFieldDecorator('tags', {
                initialValue: '',
              })(<Input 
                  placeholder='Separate tags by spaces and punct' type="textarea" 
                  onChange={this.handleTagsInputChange}
                  value={entryTags} 
                  autoComplete="off"
              />)}
            </FormItem>

            <br></br><br></br>

            <h4 style={{textAlign: 'center', letterSpacing: '1px'}}>
            <Tooltip title="Currently you can enter a URL to automatically extract the HTML, page title, and text to build a new entry (this will be greatly improved in the future)">                
                      <Icon type="question-circle" style={{ color: 'rgba(0,0,0,.25)', marginRight: '5px' }}/>
                    </Tooltip>
            Documents Ingestion / Extraction</h4>
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
                    } autoComplete="off" placeholder='http://'/>
                    )}
              </FormItem>
            
            <FormItem label="Bulk Upload"
              {...formItemLayout}
              >
              <RadioGroup 
                onChange={this.onLinkExtractionTypeChange} 
                defaultValue={'no'}
                disabled={true} 

              >
                <Radio value={'no'}>No</Radio>
                <Radio value={'yes'}>Yes</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem label="Link Extraction Type"
              {...formItemLayout}
              >
              <RadioGroup 
                onChange={this.onLinkExtractionTypeChange} 
                defaultValue={'web-extraction'}
                disabled={true} 

              >
                <Radio value={'web-extraction'}>Web crawler</Radio>
                <Radio value={'file-extraction'}>Local upload</Radio>
              </RadioGroup>
            </FormItem>

     
            <FormItem label="Auto-generate Tags"
              {...formItemLayout}
              >
            <RadioGroup 
              onChange={this.onLinkExtractionTypeChange} 
              defaultValue={'off'}
              disabled={true} 
              >
              <Radio value={'off'}>Off</Radio>
              <Radio value={'on'}>On</Radio>
            </RadioGroup>
            </FormItem>



            <br></br><br></br>
            

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
            {getFieldDecorator('timestampCreated', {
              initialValue: timestampNow,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem>
            

            <div className="hidden">
              <FormItem label="Date Modified"
              {...formItemLayout}
              >
              {getFieldDecorator('timestampLastModified', {
                initialValue: timestampNow,
                })(<Input disabled={true} type="textarea" />)}
              </FormItem>
              <div className="modalFooterBlock">
                <Button onClick={this.handleReset}>
                  Clear
                </Button>
              </div>
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
      const library = defaultFLib;
      // if (library === null || libray === undefined) {
        // library = "default";
      // }
      const m_Library = openDB(library);
      let newEntryTitle = values['title'];
      let linkToExtract = values['linkToExtract'];
      try {
        // linkToExtract = linkToExtract.replace("http:", "");
        linkToExtract = linkToExtract.replace("https:", "http:");
        // linkToExtract = linkToExtract.replace("www.", "");
        linkToExtract = linkToExtract.replace("https://www.", "http://www.");
        // linkToExtract = linkToExtract.replace("//", "");
        let _linkToExtract = 'https://cors-anywhere.herokuapp.com/' + linkToExtract;
        await message.info("Sending fetch request to link.. this could take a while. Hold tight!", 1.5);
        await fetch(_linkToExtract,
        {
            mode: 'cors',
            headers: {
              "Access-Control-Allow-Origin": "*",
              'X-Requested-With': "XMLHttpRequest",
              'Access-Control-Allow-Credentials' : 'true', 'Access-Control-Allow-Origin' : '*', 'Access-Control-Allow-Origins' : '*', 
            }
        })
        .then(async function(response) {
          await message.info("Sucessfully fetched content from link. Rendering data now..", 1.5);
          const clone = response.clone();
          clone.text().then(async function(html) {
          let htmlTitle = "";
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const all_ts = doc.getElementsByTagName("*");
          const show_ts = [];
          for (let i=0; i<all_ts.length; i++){
            if (all_ts[i].tagName == 'TITLE') {
              htmlTitle = all_ts[i].innerHTML;
            }
            if(all_ts[i].tagName == 'H1' || all_ts[i].tagName == 'H2' || all_ts[i].tagName == 'H3' ||
                all_ts[i].tagName == 'H4' || all_ts[i].tagName == 'P' || all_ts[i].tagName == 'SPAN' 
                || all_ts[i].tagName == 'UL' || all_ts[i].tagName == 'LI') {
                if (all_ts[i].innerHTML.length > 20 || countSentences(all_ts[i].innerHTML) >= 2) {
                  // console.log(all_ts[i].tagName, all_ts[i].innerHTML, countSentences(all_ts[i].innerHTML));
                  show_ts.push(all_ts[i].innerHTML);
                }
            }
          }
          if (newEntryTitle == "" || newEntryTitle == " " || newEntryTitle == "New entry") {
            newEntryTitle = htmlTitle;
            if (newEntryTitle == "" || newEntryTitle == " ") {
              newEntryTitle == "New entry";
            }
          }
          if (linkToExtract !== " " && linkToExtract !== "" && linkToExtract !== undefined && 
            linkToExtract !== "undefined") {
              values['title'] = newEntryTitle;
          }
          values['html'] = show_ts.join("<br>");
          values['strippedText'] = HTMLToText(show_ts.join(" "));
          m_Entries = await localforage.getItem("entries");
          try {
            m_Entries.unshift(values);
          } catch (err) {
            // console.log(err);
            m_Entries = [];
            m_Entries.unshift(values); // Add entry to top of tree
          }
          try {
            const res = await localforage.setItem("entries", m_Entries);
            await message.loading("Creating new library entry.. you may have to wait for a short time depending on the text length.", 2.5);
            // message.success(res);
            // console.log(res);
            form.resetFields();
            setState("entryId", null);
            _this.setState({visible: false})
            _this.props.updateEntriesMethod();
            // _this.props.updateAppMethod();        
            // _this.props.updateAppMethod();        
            // location.reload();
          } catch (err) {
            console.log(err);
            message.error("Failed to create new library entry! " + err);
            form.resetFields();
            _this.setState({visible: false});
          }
        })
        .catch(async function(err) {  
            m_Entries = await localforage.getItem("entries");
            // values['html'] = '<p></p>';
            // values['strippedText'] = '';
            try {
              m_Entries.unshift(values);
            } catch (err) {
              // console.log(err);
              m_Entries = [];
              m_Entries.unshift(values); // Add entry to top of tree
            }
            try {
              const res = await localforage.setItem("entries", m_Entries);
              await message.loading("Creating new library entry.. you may have to wait for a short time depending on the text length.", 2.5);
              form.resetFields();
              setState("entryId", null);
              // _this.props.updateEntriesMethod();     
              _this.setState({visible: false})
              _this.props.updateEntriesMethod();
              // _this.props.updateAppMethod();           
            } catch (err) {
              message.error("Failed to create new library entry! " + err);
              form.resetFields();
              _this.setState({visible: false});
            }
            // message.error("Unable to fetch page content from: " +  linkToExtract + ' - ' + err);
        });
      });
      } catch (err) {
        m_Entries = await localforage.getItem("entries");
        try {
          m_Entries.unshift(values);
        } catch (err) {
          // console.log(err);
          m_Entries = [];
          m_Entries.unshift(values); // Add entry to top of tree
        }
        try {
          const res = await localforage.setItem("entries", m_Entries);
          await message.loading("Creating new library entry.. you may have to wait for a short time depending on the text length.", 2.5);
          // message.success(res);
          // console.log(res);
          form.resetFields();
          setState("entryId", null);
          _this.setState({visible: false})
          _this.props.updateEntriesMethod();        
        } catch (err) {
          message.error("Failed to create new library entry! " + err);
          form.resetFields();
          _this.setState({visible: false});
        }
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