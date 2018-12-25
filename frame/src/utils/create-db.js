/* eslint no-unused-vars: 0 */

import localforage from 'localforage';


export default function openDB(key) {
  const store = localforage.createInstance({name: "default"});
  return store;
}