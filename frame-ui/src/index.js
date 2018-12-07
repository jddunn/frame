import React from 'react';
import ReactDOM from 'react-dom';

// import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies

import App from './components/App/App'
import './components/App/App.css';

// import registerServiceWorker from "./registerServiceWorker";

// Rather than have an index.html just create one on the fly here
const root = document.createElement('div');
root.id = "app";
document.body.appendChild( root );
document.title = "Lookback - Notes with Insight";

const rootEl = document.getElementById('app');

function render() {
  ReactDOM.render(
    <App/>,
    rootEl
  );
};

render();

// registerServiceWorker();

/* eslint-disable global-require, import/newline-after-import */
// render(require('./App').default);
// if (module.hot)
  // module.hot.accept('./app', () => render(require('./App').default));
/* eslint-enable global-require, import/newline-after-import */