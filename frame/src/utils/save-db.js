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

// Save to LocalForage (default offline storage option)

// Save to Lowdb (for smaller, strippe down app)
// const adapter = new LocalStorage('db');
// const db = low(adapter);

// Save to sessionStorage (for demo purposes)

export default function saveToDB() {

}

// export default function saveToDB() {

// }

// export default function saveToDB() {

// }
