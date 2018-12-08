import React from 'react';
import ReactDOM from 'react-dom';
// import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import App from './components/App/App'
// import registerServiceWorker from "./registerServiceWorker";

// Create root element in DOM
const root = document.createElement('div');
root.id = "app";
document.body.appendChild( root );
document.title = "Frame - Notes with Insight";

const appEl = document.getElementById('app');

function render() {
  ReactDOM.render(
    <App/>,
    appEl
  );
};

render();

// registerServiceWorker();