'use strict';
import config from '../../data/config.json';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider, Form, Input, Tag, AutoComplete
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
      allTagsFound: [],
      tagInputVisible: false,
      tagInputValue: '',
    };
    this.buildTextCorpusFromEntries = this.buildTextCorpusFromEntries.bind(this);
  }
  
  // Tag inputs

  handleClose = (removedTag) => {
    const selectedTagsToSearch = this.state.selectedTagsToSearch.filter(tag => tag !== removedTag);
    this.setState({ selectedTagsToSearch });
  }

  showInput = () => {
    this.setState({ tagInputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ tagInputValue: e.target.value });
  }

  handleInputConfirm = () => {
    const state = this.state;
    const tagInputValue = state.tagInputValue;
    let selectedTagsToSearch = state.selectedTagsToSearch
    // console.log("HANDLING INPUT TAG: ", tagInputValue, selectedTagsToSearch);
    // console.log("THIS IS TAG INPUT VALUE: ", tagInputValue);
    if (tagInputValue && selectedTagsToSearch.indexOf(tagInputValue) === -1) {
      // console.log("ADD DA TAG: ", tagInputValue);
      selectedTagsToSearch = [...selectedTagsToSearch, tagInputValue];
    }
    this.setState({
      selectedTagsToSearch,
      tagInputVisible: false,
      tagInputValue: '',
    });
  }

  saveInputRef = input => this.input = input

  // End tag input funcs

  buildTextCorpusFromEntries(tags) {

  }

  componentDidMount() {
    const Entries = this.props.Entries;
    const selectedTagsToSearch = getAllEntryTags(Entries);
    this.setState({_isMounted: true,
                   Entries: Entries,
                   selectedTagsToSearch: selectedTagsToSearch,
                   allTagsFound: selectedTagsToSearch
    });
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    const Entries = nextProps.Entries;
    let selectedTagsToSearch = this.state.selectedTagsToSearch;
    const allTagsFound = getAllEntryTags(Entries);
    if (selectedTagsToSearch.length == 0) {
      this.setState({ Entries: nextProps.Entries, allTagsFound: allTagsFound,
        selectedTagsToSearch: allTagsFound});
    } else {
      this.setState({ Entries: nextProps.Entries, allTagsFound: allTagsFound});
    }
  }

  render() {

    const { selectedTagsToSearch, allTagsFound, tagInputVisible, tagInputValue} = this.state;

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
    
    const _this = this;

    return (
            <div className="askInput">
            
            <Collapse bordered={false} defaultActiveKey={['1']} className="collapseTransparent">
                <Panel header="Ask / Search for Information" key="1" style={customPanelStyle}>
                <p>Add or remove tags to filter what entries are to be searched (by default, all tags or entries are listed)</p>
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
                  {tagInputVisible && (
     
                    <Input
                      ref={this.saveInputRef}
                      type="text"
                      size="small"
                      style={{ width: 78 }}
                      placeholder="enter tag"
                      value={tagInputValue}
                      onChange={this.handleInputChange}
                      onBlur={this.handleInputConfirm}
                      onPressEnter={this.handleInputConfirm}
                    />
                  )}
                  {!tagInputVisible && (
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