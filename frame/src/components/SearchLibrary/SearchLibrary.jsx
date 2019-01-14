'use strict';
import config from '../../data/config.json';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider, Form, Input, Tag
  } from 'antd';

import Clock from 'react-live-clock';

import AskForm from '../Ask/Ask'; 

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import './SearchLibrary.scss';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;

import { Group } from '@vx/group';
import { Tree } from '@vx/hierarchy';
import { LinkHorizontal } from '@vx/shape';
import { hierarchy } from 'd3-hierarchy';
import { LinearGradient } from '@vx/gradient';

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
const bg = '#272b4d';

import { traverseEntriesById, getAllEntryTags } from '../../utils/entries-traversal';


export default class SearchLibrary extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _isMounted: false,
      Entries: [],
      textCorpus: "",
      textCorpusWithOrigins: {},
      selectedTagsToSearch: [],
      tagInputVisible: false,
      tagInputValue: '',
    };
  }
  
  // Tag inputs

  handleClose = (removedTag) => {
    const selectedTagsToSearch = this.state.selectedTagsToSearch.filter(tag => tag !== removedTag);
    this.setState({ selectedTagsToSearch });
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let selectedTagsToSearch = state.selectedTagsToSearch
    if (inputValue && selectedTagsToSearch.indexOf(inputValue) === -1) {
      selectedTagsToSearch = [...selectedTagsToSearch, inputValue];
    }
    this.setState({
      selectedTagsToSearch,
      inputVisible: false,
      inputValue: '',
    });
  }

  saveInputRef = input => this.input = input

  // End tag input funcs


  componentDidMount() {
    const Entries = this.props.Entries;
    const selectedTagsToSearch = getAllEntryTags(Entries);
    this.setState({_isMounted: true,
                   Entries: Entries,
                   selectedTagsToSearch: selectedTagsToSearch
    });
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    const Entries = nextProps.Entries;
    const selectedTagsToSearch = getAllEntryTags(Entries);
    this.setState({ Entries: nextProps.Entries, selectedTagsToSearch: selectedTagsToSearch});
  }

  render() {

    const { selectedTagsToSearch, inputVisible, inputValue } = this.state;

    const entriesObj = {"title": "Entries",
                        "children": this.state.Entries
    };

    const entryTextToSummarize = "";

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    };

    const WrappedAskForm = Form.create()(AskForm);
    
    return (
            <div className="askInput">
            
            <Collapse bordered={false} defaultActiveKey={['1']} className="collapseTransparent">
                <Panel header="Ask / Search for Information" key="1" style={customPanelStyle}>
                <p>Add or remove tags to filter what entries are to be searched (by default, all tags or entries are searched)</p>
                  <div>
                  {selectedTagsToSearch.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                      <Tag key={tag} closable={index == index} afterClose={() => this.handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                      </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                  })}
                  {inputVisible && (
                    <Input
                      ref={this.saveInputRef}
                      type="text"
                      size="small"
                      style={{ width: 78 }}
                      value={inputValue}
                      onChange={this.handleInputChange}
                      onBlur={this.handleInputConfirm}
                      onPressEnter={this.handleInputConfirm}
                    />
                  )}
                  {!inputVisible && (
                    <Tag
                      onClick={this.showInput}
                      style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                      <Icon type="plus" /> New Tag
                    </Tag>
                  )}
                </div>
                  <WrappedAskForm entryText={entryTextToSummarize}/>
                </Panel>
              </Collapse>
            </div>
    );
  }
}