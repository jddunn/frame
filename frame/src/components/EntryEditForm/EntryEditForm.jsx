'use strict';
import config from '../../data/config.json';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio, Select, message,
  Tooltip, Icon
} from 'antd';

import './EntryEditForm.scss';

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

import { countSentences } from '../../lib/node-nlp-service';


export const EntryEditForm = Form.create()(
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
                    _isMounted: false,
                    entryEditorType: 'flow',
                    visible: false,
                    // webLinkToExtract: ''
    };
      this.handleEditorChange = this.handleEditorChange.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleTitleInputChange = this.handleTitleInputChange.bind(this);
      this.handleTagsInputChange = this.handleTagsInputChange.bind(this);
    }

    componentDidMount() {
      this.setState({_isMounted: true, visible: this.props.visible});
    }

    componentWillUnmount() {
      this.setState({_isMounted: false});
    }

    componentWillReceiveProps(nextProps) {
      if (this.state._isMounted) {
        // Ignore receiving new props if we're editing (and not on a different entry)
        if (nextProps.entryId !== this.state.entryId) {
          const Entries = nextProps.Entries;
          const entryVals = nextProps.entryVals;
          const entryId = nextProps.entryId;
          const visible = getState("entryEditVisible");
          if (visible) {
            try {
              this.setState({ Entries: Entries, entryId: entryId, entryVals: entryVals,
                entryTags: entryVals.tags, entryTitle: entryVals.title, 
                entrySubtitle: entryVals.subtitle, entryEditorType:
                entryVals.editorType, entryTimestampCreated: entryVals.timestampCreated,
                entryTimestampLastModified: entryVals.timestampLastModified,
                visible: true
              });
              // setState("entryEditVisible", true);
            } catch (err) {
            }
          }
        } else {
          this.setState({visible: false});
          // setState("entryEditVisible", false);
        }
      }
    }
  
    
    handleEditorChange(value) {
      // console.log(`selected ${value}`);
    }

    handleReset() {
      this.setState({entryTitle: 'Editing entry: ', entryTags: [], entrySubtitle: '',
                        timestamp:'', entrySubtitleTagsPlaceholder: '',
                        timestamp:'', entrySubtitleTagsPlaceholder: '',
                        visible: false
      });
      setState("entryEditVisible", false);
      this.props.updateAppMethod();
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
        onCancel, onSave, form,
      } = this.props;
      // const visible = this.state.visible;
      const visible = getState("entryEditVisible");
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 9,
        },
        wrapperCol: { span: 14 }
      };
      const buttonItemLayout = {
        wrapperCol: { span: 14, offset: 2
        }
      };

      const { entryTags, entryTitle, entrySubitlte,
              entryId, entryEditorType, entryTimestampCreated,
              entryTimestampLastModified } = this.state;
 
      const timestampNow = getTimestamp();


      return (
        <Modal
          id="entryCreateModal"
          mask={false}
          visible={visible}
          title={"Editing: " + entryTitle}
          okText="Save"
          onCancel={onCancel}
          onOk={onSave}
        >
          <div className="entryTimestampBlock">
            <p>{timestampNow}</p>
          </div>
          <Form formLayout={"horizontal"}>
            <FormItem label="Title"
              {...formItemLayout}
              >
              {getFieldDecorator('title', {
                initialValue: this.state.entryTitle,
                rules: [{ required: true, message: 'Title of entry is required' }],
              })(
                <Input onChange={this.handleTitleInputChange}  autoComplete="off" placeholder='New entry'/>
              )}
            </FormItem>
            <FormItem label="Document Type"
                {...formItemLayout}
              >
              {getFieldDecorator('editorType', {
                  initialValue: this.state.entryEditorType,
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
                initialValue: this.state.entryTags,
              })(<Input 
                  placeholder='Separate tags by commas' type="textarea" 
                  onChange={this.handleTagsInputChange}
                  value={entryTags}
                  autoComplete="off"
              />)}
            </FormItem>
            <br></br><br></br>
            <FormItem label="Description"
              {...formItemLayout}
              >
              {getFieldDecorator('subtitle', {
                  initialValue: this.state.entrySubtitle,
                  rules: [{}],
              })(<Input.TextArea 
                  autoComplete="off"
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
              initialValue: entryId,
              })(<Input disabled={true} type="textarea"
                  autoComplete="off"         
              />)}
            </FormItem>
           <FormItem label="Date Created"
            {...formItemLayout}
            >
            {getFieldDecorator('dateCreated', {
              initialValue: entryTimestampCreated,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem>

            <FormItem label="Date Modified (New)"
            {...formItemLayout}
            >
            {getFieldDecorator('dateModified', {
              initialValue: timestampNow,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem>

            <div className="modalFooterBlock">
              <Button onClick={this.handleReset}>
                Clear
              </Button>
            </div>

          </Form>
        </Modal>
      );
    }
  }
);