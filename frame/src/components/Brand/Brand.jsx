'use strict';
import React, { Component } from 'react';
import styles from './Brand.scss';

export default class Brand extends Component {
  componentDidMount() {
    const options = { onChange: this.props.onChange };
    this._container = document.getElementById('jsonEditor');
  }

  render() {
    return (
      <div className="brandContainer">
        <div className="logo">
          <h4 className="brandTitle">F R A M E</h4> <p className="brandSubtitle">v 0.1.0</p>
          </div>
      </div>
    );
  }
}
