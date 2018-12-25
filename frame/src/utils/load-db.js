/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint consistent-return: 0 */ 
/* eslint no-alert: 0 */

import localforage from "localforage";

// Load from LocalForage (default offline storage option)
export default function getFromDB (key) {
  localforage.getItem(key, function(err, value) {
    if (err) {
      console.error(err);
      alert(err);
      return null;
    }
    console.log("Getting item from ", key, value);
    return value;
  });
}