'use strict';
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
import traverseEntriesById from '../../utils/entries-traversal';
import replaceEntry from '../../utils/replace-entry';

import styles from './Visualizer.scss';


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

  componentWillReceiveProps(nextProps) {
    this.setState({entry: nextProps.entry});
  }

  buildTermsRadar() {
    const terms = this.state.entry.terms;
    let container = [];
    terms.each(function(el) {
      
    });
    return container;
  }

  render() {
    if (this.state._isMounted) {
      console.log("THIS STATE: ", this.state.entry);



      return (
        <React.Fragment>
          {/* Tab components */}
          <Wrapper letterNavigation={true}>
                  <TabList>
                    <ul className='FancyTabs-tablist'>
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
                      
                      {/*  
                      <li className='FancyTabs-tablistItem'>
                        <Tab id='t4' className='FancyTabs-tab'>
                        {visualizationTabs.bind(null, (
                            <div>
                              <span className='FancyTabs-tabTextSmall'>
                                Information Extraction
                              </span>
                            </div>
                          ))}
                        </Tab>
                      </li>

                      <li className='FancyTabs-tablistItem'>
                        <Tab id='t5' className='FancyTabs-tab'>
                        {visualizationTabs.bind(null, (
                            <div>
                              <span className='FancyTabs-tabTextSmall'>
                                Metadata
                              </span>
                            </div>
                          ))}
                        </Tab>
                      </li>
                      */}
                    </ul>
                  </TabList>
                  <div className='FancyTabs-panel'>
                    <TabPanel tabId='t1'>
                      <div className='FancyTabs-panelInner' style={{height: '100%', width: '100%'}}>
                        <div className="leftViz">
                          <h4 className="innerContentTextCenter">
                          Terms ({this.state.entry.entities.terms.length})
                          </h4>
                          <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={this.state.entry.entities.terms}>
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
                        <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={this.state.entry.entities.topics}>
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
                          <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={this.state.entry.entities.people}>
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
                          <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={this.state.entry.entities.places}>
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
                          <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={this.state.entry.entities.organizations}>
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
                          <RadarChart cx={200} cy={200} outerRadius={150} width={500} height={400} data={this.state.entry.dates}>
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
                          <LineChart width={700} height={220} data={this.state.entry.wordFrequency}
                                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <XAxis dataKey="word"/>
                            <YAxis/>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#29b3e0" />
                          </LineChart>
                        </div>
                      </div>
                    </TabPanel>
                    {/* 
                    <TabPanel tabId='t4'>
                    <div className='FancyTabs-panelInner'>
                      </div>
                    </TabPanel>
                    <TabPanel tabId='t5'>
                    </TabPanel> */}
                  </div>
            </Wrapper>
        </React.Fragment>
      );
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