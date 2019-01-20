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

import AskMain from '../AskMain/AskMain'; 

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

import { traverseEntriesById, getAllEntryTags,
         getEntriesTextsByTags, getEntriesByTags
} from '../../utils/entries-traversal';


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
    };
    this.buildTextCorpusFromEntries = this.buildTextCorpusFromEntries.bind(this);
  }
  
  // Tag inputs

  handleClose = (removedTag) => {
    const Entries = this.state.Entries;
    const selectedTagsToSearch = this.state.selectedTagsToSearch.filter(tag => tag !== removedTag);
    const textCorpusWithOrigins = getEntriesTextsByTags(selectedTagsToSearch, Entries);
    const textCorpus = this.buildTextCorpusFromEntries(textCorpusWithOrigins); 
    this.setState({ selectedTagsToSearch, textCorpus, textCorpusWithOrigins });
  }

  showInput = () => {
    this.setState({ tagInputVisible: true });
      // , () => this.input.focus());
  }

  clearTags = () => {
    this.setState({ tagInputVisible: true,
      selectedTagsToSearch: []
    });
    // , () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ tagInputValue: e.target.value });
  }

  // End tag input funcs

  buildTextCorpusFromEntries(filteredEntries) {
    let corpus = "";
    Object.keys(filteredEntries).forEach(function(key) {
      corpus += " " + filteredEntries[key]; 
    });
    return corpus;
  }

  componentDidMount() {
    const Entries = this.props.Entries;
    const selectedTagsToSearch = getAllEntryTags(Entries);
    const filteredEntries = getEntriesTextsByTags(selectedTagsToSearch, Entries);
    const textCorpus = this.buildTextCorpusFromEntries(filteredEntries); 
    this.setState({_isMounted: true,
                   Entries: Entries,
                   selectedTagsToSearch: selectedTagsToSearch,
                   allTagsFound: selectedTagsToSearch,
                   textCorpus: textCorpus,
                   textCorpusWithOrigins: filteredEntries
    });
  }

  componentWillUnount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    const Entries = nextProps.Entries;
    let selectedTagsToSearch = this.state.selectedTagsToSearch;
    const allTagsFound = getAllEntryTags(Entries);
    const filteredEntries = getEntriesTextsByTags(selectedTagsToSearch, Entries);
    const textCorpus = this.buildTextCorpusFromEntries(filteredEntries); 
    if (selectedTagsToSearch.length == 0) {
      this.setState({ Entries: nextProps.Entries, allTagsFound: allTagsFound,
        selectedTagsToSearch: allTagsFound,
        textCorpus: textCorpus, textCorpusWithOrigins: filteredEntries
      });
    } else {
      this.setState({ Entries: nextProps.Entries, allTagsFound: allTagsFound,
                      textCorpus: textCorpus, textCorpusWithOrigins: filteredEntries
      });
    }
  }

  handleSearch = (value) => {
    this.setState({
      dataSource: !value ? [] : [
        value,
        value + value,
        value + value + value,
      ],
    });
  }

  onSelect = (value) => {
    const state = this.state;
    let selectedTagsToSearch = state.selectedTagsToSearch
    if (value && selectedTagsToSearch.indexOf(value) === -1) {
      selectedTagsToSearch = [...selectedTagsToSearch, value];
    }
    const Entries = this.state.Entries;
    const filteredEntries = getEntriesTextsByTags(selectedTagsToSearch, Entries);
    const textCorpus = this.buildTextCorpusFromEntries(filteredEntries); 
    this.setState({
      selectedTagsToSearch: selectedTagsToSearch,
      tagInputVisible: false,
      textCorpus: textCorpus,
      textCorpusWithOrigins: filteredEntries
    });
  }

  render() {

    const { selectedTagsToSearch, allTagsFound, tagInputVisible,
            textCorpus, Entries
    } = this.state;

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

    const WrappedAskForm = Form.create()(AskMain);
    
    const _this = this;

    return (
      <React.Fragment>
            <br/>
            <div className="askInput">
              <div>
              <div className="tagsHolder">
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
              <AutoComplete
                dataSource={allTagsFound}
                style={{ width: 78 }}
                onSelect={this.onSelect}
                onSearch={this.handleSearch}
                placeholder="enter tag"
                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
              />
              )}
              {!tagInputVisible && (
                <React.Fragment>
                <Tag
                  onClick={this.showInput}
                  style={{ background: '#fff', borderStyle: 'dashed' }}
                >
                  <Icon type="plus" /> Add tag
                </Tag>
                <Tag
                onClick={this.clearTags}
                style={{ background: '#fff', borderStyle: 'dashed' }}
              >
                <Icon type="close" /> Remove tags
              </Tag>
              </React.Fragment>
              )}
              <br/>
              <p className="titleTextP">Add or remove tags to filter what entries are to be searched (by default, all tags are listed / searched)</p>
              </div>
              <br/>
            </div>
            <Collapse bordered={false} defaultActiveKey={['1']} className="collapseTransparent">
                <Panel header="Ask / Search for Information" key="1" style={customPanelStyle}>
                  <WrappedAskForm entryText={textCorpus} updateAppMethod={this.props.updateAppMethod}
                                  Entries={Entries}
                  />
                </Panel>
              </Collapse>
            </div>
        </React.Fragment>
    );
  }
}