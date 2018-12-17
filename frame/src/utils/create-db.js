import localforage from 'localforage';

export default function createNewFLib(key) {
  const store = localforage.createInstance({name: key});
  return store;
}