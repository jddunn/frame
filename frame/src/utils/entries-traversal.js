/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */

function *traverseEntriesGenerator(Entries) {
    if (!Entries) { return; }
    for (let i = 0; i< Entries.length; i++){
        const val = Entries[i];
        console.log("Val: ", val);
        yield val;
        if (val.children) {
        yield *traverseEntriesGenerator(val.children);
        }
    }
}

export default function traverseEntriesById(id, Entries) {
    const next = traverseEntriesGenerator(Entries);
    let res = next.next();
    // Need to wrap this in try..catch because React
    // fetches data asynchronously but calls the render funcs
    // (and therefore this func) before it gets the Entries.
    try {
        if (id === res.value.id) {
            return res.value;
        }
    } catch (err) {
    }
    while (!res.done) {
        res = next.next();
        try {
            if (id === res.value.id) {
                return res.value;
            }
        } catch (err) {
        }
    }
    return null;
}