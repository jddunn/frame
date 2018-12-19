/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

export default function saveToDB(store, key, value) {
    // store.setItem(key, value).then(function (result) {
    //     // console.log("Saved to store ", key, ':', store);
    //     // console.log(result);
    //     return result;
    // }).catch(function(err) {
    //     // console.log(err);
    //     return null;
    // });
    const res = store.setItem(key, value);
    return res;
}
  