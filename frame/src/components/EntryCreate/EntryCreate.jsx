'use strict';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio,
} from 'antd';

import './EntryCreate.scss';

import getTimestamp from '../../utils/get-timestamp';
import generateUUID from '../../utils/generate-uuid';

const FormItem = Form.Item;
const { TextArea } = Input;


const EntryCreateForm = Form.create()(
  // eslint-disable-next-line
  class extends Component {

    constructor(props) {
      super(props);
      this.state = {entryTags: {}};
      this.handleTagsInputChange = this.handleTagsInputChange.bind(this);
    }

    handleTagsInputChange(event) {
      let val;
      let tags = [];
      val = event.target.value.trim();
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
      let tagsLength;
      try {
        tagsLength = Object.keys(entryTags).length;
      } catch (err) {
        tagsLength = 0;
      }
      const subtitleInitialText = 'Date: ' + timestampNow + '\xa0\xa0\xa0\xa0\n' + 'Tags: ';
      let subtitleDefaultText;
      if (tagsLength <= 0) {
        subtitleDefaultText = subtitleInitialText + ' none';
      } else {
        subtitleDefaultText = subtitleInitialText + entryTags.toString();
      }
      return (
        <Modal
          visible={visible}
          title="Create a new library entry"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form formLayout={"horizontal"}>
            <FormItem label="Title"
              {...formItemLayout}
              >
              {getFieldDecorator('title', {
                initialValue: 'New entry',
                rules: [{ required: true, message: 'A of entry is required' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="Subtitle"
              {...formItemLayout}
              >
              {getFieldDecorator('subtitle', {
                  initialValue: subtitleDefaultText,
                  rules: [{}],
                  // })(<Input />);
                  // initialValue: 'Date: ' + timestampNow + '   ' + 'Tags: ' 
              })(<TextArea autosize={{ minRows: 2, maxRows: 6 }}/>)}
            </FormItem>
            <FormItem label="Unique ID"
                {...formItemLayout}
              >
              {getFieldDecorator('unique id', {
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
            <FormItem label="Category Tags"
                {...formItemLayout}
              >
              {getFieldDecorator('category tags', {
              })(<Input 
                  placeholder='Separate tags with ", "' type="textarea" 
                  onChange={this.handleTagsInputChange} 
              />)}
            </FormItem>
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
    this.setState({ visible: false });
  }

  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      form.resetFields();
      this.setState({ visible: false });
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
