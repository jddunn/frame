/** Extend Storage with JSON helpers */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

const sessionStore = sessionStorage;

export function saveSessionState() {
    
}

export function getSessionState() {

}