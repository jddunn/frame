'use strict';
import config from '../../data/config.json';
import React, { Component } from "react";
import PropTypes, { shape } from 'prop-types';
import {setState, getState} from '../../utils/session-state';
import {
  Row, Col, Layout, Menu, Breadcrumb,
  Icon, Button, Switch, Dropdown, message,
  Tooltip, Select, Drawer, Radio, Collapse, List,
  Divider, Treemap, Legend
  } from 'antd';

import { Wrapper, Tab, TabList, TabPanel} from 'react-aria-tabpanel';

import { LineChart, Line, XAxis, YAxis, CartesianGrid,
         PolarGrid, PolarAngleAxis, PolarRadiusAxis,
         Radar, RadarChart
} from 'recharts';

import saveToDB from '../../utils/save-db';
import getFromDB from '../../utils/load-db';
import openDB from '../../utils/create-db';
import { traverseEntriesById } from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import styles from './Visualizer.scss';

/** Data library / source vars */
const savedSettings = config.savedSettings;
const defaultFLib = savedSettings.defaultLibrary;

export default class Visualizer extends Component {

  constructor(props) {
    super(props);
    this.state = {  entry: {},
                    _isMounted: false
                  };
    this.buildTermsRadar = this.buildTermsRadar.bind(this)
  }

  componentDidMount() {
    this.setState({_isMounted: true,
                   entry: this.props.entry
    });
  }

  componentWillMount() {
    this.setState({_isMounted: true,
      entry: this.props.entry
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({entry: nextProps.entry, Entries: nextProps.Entries});
  }

  getEntries(Library, key) {
    let Entries = [];
    // await getFromDB(Library, key).then(function(result) {
    //   Entries = result;
    // }).catch(function(err) {
    //   Entries = [];
    // });
    Entries = getFromDB(Library, key)
    return Entries;
  }

  buildTermsRadar() {

    if (this.state._isMounted) {
    const terms = this.state.entry.terms;
    let container = [];
    terms.each(function(el) {
      
    });
    return container;
  } return null;
  }

  render() {
    if (this.state._isMounted) {
      let selectedEntry;
      const stateFound = getState("entryId");
      // let library = getState("library");
      let library = defaultFLib;
      if (this.state.entry !== null && this.state.entry !== undefined &&
          this.state.entry !== "undefined" && this.state.entry.length > 0  
        ) {
          selectedEntry = this.state.entry;
        } else {
          selectedEntry = traverseEntriesById(stateFound, this.props.Entries);
        }
        try {
          return (
            <React.Fragment>
              {/* Tab components */}
              <Wrapper letterNavigation={true}>
                      <TabList>
                        <ul className='FancyTabs-tablistHigher'>
                          <li className='FancyTabs-tablistItem'>
                            <Tab id='t1' className='FancyTabs-tab'>
                              {visualizationTabs.bind(null, (
                                <div>
                                  {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' /> */}
                                  <span className='FancyTabs-tabTextSmall'>
                                    Key Terms / Topics
                                  </span>
                                </div>
                              ))}
                            </Tab>
                          </li>
                          <li className='FancyTabs-tablistItem'>
                            <Tab id='t2' className='FancyTabs-tab'>
                            {visualizationTabs.bind(null, (
                                <div>
                                  {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--map' /> */}
                                  <span className='FancyTabs-tabTextSmall'>
                                    Entities
                                  </span>
                                </div>
                              ))}
                            </Tab>
                          </li>
                          <li className='FancyTabs-tablistItem'>
                            <Tab id='t3' className='FancyTabs-tab'>
                            {visualizationTabs.bind(null, (
                                <div>
                                  {/* <span className='FancyTabs-tabIcon FancyTabs-tabIcon--megaphone' /> */}
                                  <span className='FancyTabs-tabTextSmall'>
                                    Frequency
                                  </span>
                                </div>
                              ))}
                            </Tab>
                          </li>
                        </ul>
                      </TabList>
                      <div className='FancyTabs-panel'>
                        <TabPanel tabId='t1'>
                          <div className='FancyTabs-panelInner' style={{height: '100%', width: '100%'}}>
                            <div className="leftViz">
                              <h4 className="innerContentTextCenter">
                              Terms ({this.state.entry.entities.terms.length})
                              </h4>
                              <RadarChart cx={220} cy={220} outerRadius={180} width={480} height={420} data={this.state.entry.entities.terms}>
                                <PolarGrid />
                                  <PolarAngleAxis dataKey="normal" />
                                  <PolarRadiusAxis/>
                                  <Radar name="Terms" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                              </RadarChart>
                            </div>
                            <div className="rightViz">
                            <h4 className="innerContentTextCenter">
                              Topics ({this.state.entry.entities.topics.length})
                            </h4>            
                            <RadarChart cx={220} cy={220} outerRadius={180} width={480} height={420} data={this.state.entry.entities.topics}>
                                <PolarGrid />
                                  <PolarAngleAxis dataKey="normal" />
                                  <PolarRadiusAxis/>
                                  <Radar name="Topics" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                              </RadarChart>
                            </div>
                          </div>
                        </TabPanel>
                        <TabPanel tabId='t2'>
                          <div className='FancyTabs-panelInner'>
                            <div className="leftViz">
                              <h4 className="innerContentTextCenter">
                                  People ({this.state.entry.entities.people.length})
                              </h4>            
                              <RadarChart cx={250} cy={250} outerRadius={150} width={480} height={420}  data={this.state.entry.entities.people}>
                                    <PolarGrid />
                                      <PolarAngleAxis dataKey="normal" />
                                      <PolarRadiusAxis/>
                                      <Radar name="Topics" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                                  </RadarChart>
                              </div>
                              <div className="rightViz">
                              <h4 className="innerContentTextCenter">
                                  Places ({this.state.entry.entities.places.length})
                              </h4>            
                              <RadarChart cx={250} cy={250} outerRadius={150} width={480} height={420} data={this.state.entry.entities.places}>
                                    <PolarGrid />
                                      <PolarAngleAxis dataKey="normal" />
                                      <PolarRadiusAxis/>
                                      <Radar name="Topics" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                                  </RadarChart>
                              </div>
                              <div className="leftViz">
                              <h4 className="innerContentTextCenter">
                                  Organizations ({this.state.entry.entities.organizations.length})
                              </h4>            
                              <RadarChart cx={250} cy={250} outerRadius={150} width={480} height={420} data={this.state.entry.entities.organizations}>
                                    <PolarGrid />
                                      <PolarAngleAxis dataKey="normal" />
                                      <PolarRadiusAxis/>
                                      <Radar name="Topics" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                                  </RadarChart>
                              </div>
                              <div className="rightViz">
                              <h4 className="innerContentTextCenter">
                                  Dates ({this.state.entry.entities.dates.length})
                              </h4>            
                              <RadarChart cx={250} cy={250} outerRadius={150} width={480} height={420} data={this.state.entry.dates}>
                                    <PolarGrid />
                                      <PolarAngleAxis dataKey="normal" />
                                      <PolarRadiusAxis/>
                                      <Radar name="Topics" dataKey="count" stroke="#29b3e0" fill="#29b3e0" fillOpacity={0.8}/>
                                  </RadarChart>
                              </div>
                            </div>
                        </TabPanel>
                        <TabPanel tabId='t3'>
                          <div className='FancyTabs-panelInner'>
                              <div className="centerViz">
                              <h4 className="innerContentTextCenter">
                                  Most Frequent Words
                              </h4>            
                              <LineChart width={900} height={320} data={this.state.entry.wordFrequency}
                                    margin={{top: 5, right: 30, left: 120, bottom: 5}}>
                                <XAxis dataKey="word"/>
                                <YAxis/>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#29b3e0" />
                              </LineChart>
                            </div>
                          </div>
                        </TabPanel>
                      </div>
                </Wrapper>
            </React.Fragment>
          );
        } catch (err) {
          // console.log(err);
          return null;
        }
      } else {
        return null;
      }
    }
}

// Tab switch handler
function visualizationTabs(content, tabState) {
  let cl = 'FancyTabs-tabInner';
  if (tabState.isActive) cl += ' is-active';
  return (
    <div className={cl}>
      {content}
    </div>
  );
}