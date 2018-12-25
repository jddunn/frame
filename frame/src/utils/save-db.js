/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */
/* eslint consistent-return: 0 */

import localforage from "localforage";

export default function saveToDB(key, value) {
    // store.setItem(key, value).then(function (result) {
    //     // console.log("Saved to store ", key, ':', store);
    //     // console.log(result);
    //     return result;
    // }).catch(function(err) {
    //     // console.log(err);
    //     return null;
    // });

    localforage.setItem(key, value, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            // console.log("Saved data to db: ", key, value, result);
            return result;
        }
    });
}
  