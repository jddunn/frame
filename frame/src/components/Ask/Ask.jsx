
'use strict';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider, Form, Input
  } from 'antd';

import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';

import Visualizer from '../Visualizer/Visualizer';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import ReactJson from 'react-json-view';
// import DOMify from 'react-domify';

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import './Ask.scss';


export default class AskForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        fetch("http://localhost:80/api/make_predict", {
          method: "POST",
          mode: 'cors',
          body: JSON.stringify(values),
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
                    },
          credentials: "same-origin"
        }).then(function(response) {
          return response.json()
        })
        .then(function(myJson) {
         console.log(myJson);
        })
        .catch(err => {
            console.log(err);
            message.error(err);
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          {getFieldDecorator('question', {
            rules: [{ required: true, message: 'Input a Question' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Ask your question" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('passage', {
            initialValue: this.props.entryText,
            rules: [{ required: true, message: 'Passage of text' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} disabled={true}/>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" >
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}