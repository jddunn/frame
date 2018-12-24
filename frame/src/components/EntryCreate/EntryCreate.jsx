'use strict';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio, Select, message,
  Tooltip
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
      this.state = {entryTags: [], entryTitle: 'New entry', entrySubtitle: '', 
                    timestamp:'', entrySubtitleTagsPlaceholder: ''
    };
      this.handleEditorChange = this.handleEditorChange.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleTitleInputChange = this.handleTitleInputChange.bind(this);
      this.handleTagsInputChange = this.handleTagsInputChange.bind(this);
    }
    
    handleEditorChange(value) {
      console.log(`selected ${value}`);
    }

    handleReset() {
      this.setState({entryTitle: 'New entry', entryTags: [], entrySubtitle: '',
                        timestamp:'', entrySubtitleTagsPlaceholder: ''
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
        console.log(err);
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
        labelCol: { span: 6 },
        wrapperCol: { span: 13 }
      };
      const buttonItemLayout = {
        wrapperCol: { span: 14, offset: 4
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

  handleCreate = () => {
    const form = this.formRef.props.form;
    let m_Entries;
    var _this = this;
    form.validateFields((err, values) => {
      if (err) {
        message.error(err);
        return;
      }
      console.log("FORM VALUES: ", values);
      const library = getState("library");
      // if (library === null || libray === undefined) {
        // library = "default";
      // }
      const m_Library = openDB("default");
      console.log(library, m_Library);
      getFromDB(m_Library, "entries").then(function(result) {
        m_Entries = result;
        if (m_Entries === null || m_Entries === undefined || m_Entries === '[]') {
          m_Entries = [];
        }
        console.log("THIS IS M_ENTRIES: ", m_Entries);
        m_Entries.unshift(values); // Add entry to top of tree
        saveToDB(m_Library, "entries", m_Entries).then(function(result) {
          message.success("Created new library entry!");
          form.resetFields();
          _this.setState({visible: false})
          _this.props.updateEntriesMethod();
        })
      }).catch(function(err) {
        message.error("Failed to create new library entry! " + err);
        form.resetFields();
        _this.setState({visible: false});
      });
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