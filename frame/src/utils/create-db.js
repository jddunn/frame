import localforage from 'localforage';

export default function openLib(key) {
  const store = localforage.createInstance({name: key});
  return store;
}