import config from '../../data/config.json';
/** Data storage (localForage by default) */
/** LocalForage */
import localForage from 'localforage';
/** Lowdb */
// import low from 'lowdb';
// import LocalStorage from 'lowdb/adapters/LocalStorage';
/** Data library / source vars */
const savedSettings = config.savedSettings;
const flibsPath = savedSettings.librariesPath;
const defaultFLib = savedSettings.defaultLibrary;
const initialFLibPath = flibsPath + '/' + defaultFLib + '/' + defaultFLib + '.json';

// Load from LocalForage (default offline storage option)
localforage.setDriver([
  localforage.INDEXEDDB,
  localforage.WEBSQL,
  localforage.LOCALSTORAGE
  ]).then(function() {
    const key = defaultFlib;
    localforage.setItem(key, value, function() {
      console.log('Using:' + localforage.driver());
      console.log('Saved: ' + value);

    });
  });

// Load from Lowdb (for smaller, strippe down app)
// const adapter = new LocalStorage('db');
// const db = low(adapter);

// Load from sessionStorage (for demo purposes)

export default function loadFromDB () {

}

// export default function loadFromDB () {

// }

// export default function loadFromDB () {

// }