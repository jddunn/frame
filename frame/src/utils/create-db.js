import localforage from 'localforage';

export default function createNewLib(key) {
  const store = localforage.createInstance({name: key});
  return store;
}