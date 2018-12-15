'use strict';
import React, { Component } from 'react';
import {
  Button, Modal, Form, Input, Radio,
} from 'antd';
import './EntryCreate.scss';

import getTimestamp from '../../utils/get-timestamp';
import generateUUID from '../../utils/generate-uuid';

const FormItem = Form.Item;

const EntryCreateForm = Form.create()(
  // eslint-disable-next-line
  class extends Component {
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
                initialValue: subtitlePlaceholderText,
              })(<Input type="textarea" />)}
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
              })(<Input placeholder="Enter words separated by commas" type="textarea" />)}
            </FormItem>

            {/* <FormItem label="Date Modified"
              {...formItemLayout}
              >
              {getFieldDecorator('date created', {
                initialValue: timestampNow,
              })(<Input disabled={true} type="textarea" />)}
            </FormItem> */}
            {/* <FormItem className="collection-create-form_last-form-item">
              {getFieldDecorator('modifier', {
                initialValue: 'public',
              })(
                <Radio.Group>
                  <Radio value="public">Public</Radio>
                  <Radio value="private">Private</Radio>
                </Radio.Group>
              )}
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
