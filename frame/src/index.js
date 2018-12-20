import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App'

import './assets/css/all.css';
import './assets/js/all';
// import registerServiceWorker from "./registerServiceWorker";

// Create root element in DOM
const root = document.createElement('div');
root.id = "app";
document.body.appendChild( root );
document.title = "Frame - notebook that insights";

const appEl = document.getElementById('app');

function render() {
  ReactDOM.render(
    <App/>,
    appEl
  );
};

render();

// registerServiceWorker();