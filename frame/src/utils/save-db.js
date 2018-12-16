import config from '../../data/config.json';
/** Data storage (localForage by default) */
/** LocalForage */
import localForage from 'localforage';
/** Lowdb */
import low from 'lowdb';
import LocalStorage from 'lowdb/adapters/LocalStorage';
/** Data library / source vars */
const savedSettings = config.savedSettings;
const flibsPath = savedSettings.librariesPath;
const defaultFLib = savedSettings.defaultLibrary;
const initialFLibPath = flibsPath + '/' + defaultFLib + '/' + defaultFLib + '.json';
/*
  Lowdb
  TODO:Write logic to handle switching between LocalStorage
  and writing to a server file (when not using browser)
*/
const adapter = new LocalStorage('db');
const db = low(adapter);

// Save to localForage (default)

// Save to sessionStorage (for demo purposes)

// Save to Lowdb (for smaller, strippe down app)

export default function saveToDB() {

}

// export default function saveToDB() {

// }

// export default function saveToDB() {

// }
