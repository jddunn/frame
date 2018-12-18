'use strict';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio, Select
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
      this.state = {entryTags: {}, entryTitle: 'New entry'};

      this.handleEditorChange = this.handleEditorChange.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleTitleInputChange = this.handleTitleInputChange.bind(this);
      this.handleTagsInputChange = this.handleTagsInputChange.bind(this);
    }

    
    handleEditorChange(value) {
      console.log(`selected ${value}`);
    }

    handleReset() {
      this.setState({entryTitle: 'New entry', entryTags: []});
    }

    handleTitleInputChange(event) {
      let val;
      val = event.target.value;
      this.setState({entryTitle: val});
    }

    handleTagsInputChange(event) {
      let val;
      let tags = [];
      val = event.target.value.trim();
      val = val.split(/[^a-zA-Z-]+/g).filter(v=>v).join(', ');
      try {
        vals = val.split(',');
        for (let i=0; i<vals.length; i++) {
          tags.push(vals[i]);
        }
      } catch (err) {
        tags.push(val);
      }
      this.setState({entryTags: tags});
    }

    render() {
      const {
        visible, onCancel, onCreate, form,
      } = this.props;
      const { getFieldDecorator } = form;

      const timestampNow = getTimestamp();
      const subtitlePlaceholderText = timestampNow + ' - ';
      const uuid = generateUUID();

      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 12 }
      };
      const buttonItemLayout = {
        wrapperCol: { span: 14, offset: 4
        }
      };
      let entryTags = this.state.entryTags;
      let entryTitle = this.state.entryTitle;
      let tagsLength;
      try {
        tagsLength = Object.keys(entryTags).length;
      } catch (err) {
        tagsLength = 0;
      }
      const subtitleInitialText = 'Date: ' + timestampNow + '\xa0\xa0\xa0\xa0' + 'Tags: ';
      let subtitleDefaultText;
      if (tagsLength <= 0) {
        subtitleDefaultText = subtitleInitialText + ' none';
      } else {
        subtitleDefaultText = subtitleInitialText + entryTags.toString();
      }
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
                initialValue: entryTitle,
                rules: [{ required: true, message: 'Title of entry is required' }],
              })(
                <Input onChange={this.handleTitleInputChange} placeholder={entryTitle}/>
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
                <Option value="full">Full</Option>
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
              />)}
            </FormItem>
            <FormItem label="Description"
              {...formItemLayout}
              >
              {getFieldDecorator('description', {
                  initialValue: subtitleDefaultText,
                  rules: [{}],
              })(<TextArea 
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
            {getFieldDecorator('date created', {
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
    this.setState({ visible: true });
  }

  handleCancel = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: false, entryTags: [], entryTitle: 'New entry' });
  }


  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const library = getState("library");
      console.log("SAVE TO LIBRARY: ", library);
      const m_Library = openDB(library);
      // const m_Entries = this.getLibrary(m_Library);
      let m_Entries = [];
      m_Entries.push(values);
      saveToDB(m_Library, "entries", m_Entries);
      // async () => {
      //   console.log("DOING ASYNC");
      //   await getFromDB(m_Library, "entries").then(function(result) {
      //     console.log("DB RESULT: " , result);
      //     m_Entries = result;
      //     console.log("m_ENTRIES: ", m_Entries);
      //     // m_Entries.push(values);
      //     console.log(m_Entries);
      //     saveToDB(m_Library, "entries", m_Entries);
      //     form.resetFields();
      //     this.setState({ visible: false, entryTags: [], entryTitle: 'New entry' });
      //   }).catch(function(err) {
      //     console.log("DB ERR: " , err);
      //     m_Entries = null;
      //     alert("Error creating new entry: ", err);
      //     this.setState({ visible: false, entryTags: [], entryTitle: 'New entry' });
      //   });
      // };
      
      this.setState({ visible: false, entryTags: [], entryTitle: 'New entry' });

    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    return (
      <div className="primaryGhostButton"
        style={{display: 'inline'}}>
        <Button 
          type="primary"
          ghost={true} 
          icon="edit"
          onClick={this.showModal}
          className="textButton"
          >
          New
          </Button>
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
