/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */

// Load from LocalForage (default offline storage option)
export default function getFromDB (store, key) {
  // var res;
  // store.getItem(key).then(function(result) {
      // return result;
      // res = result;
  // });
  // store.getItem(key).then(function (result) {
  //       console.log(result);
  //       return result;
  //   }).catch(function(err) {
  //       console.log(err);
  //       return null;
  //   });
  const res = store.getItem(key);
  return res;
}