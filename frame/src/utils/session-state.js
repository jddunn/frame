/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */

// State management with sessionStorage

/** Extend Storage with JSON helpers */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

const sessionStore = sessionStorage;

export function setState(key, val) {
    // console.log(key, val);
    return(sessionStore.setObject(key, val));
}

export function getState(key) {
    // console.log(key);
    return(sessionStore.getObject(key));
}