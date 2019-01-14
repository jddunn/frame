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
        yield val;
        if (val.children) {
        yield *traverseEntriesGenerator(val.children);
        }
    }
}

export function traverseEntriesById(id, Entries) {
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
    // return null;
    if (res.value) return res.value;
    return null;
}

export function getEntriesByTags(tags, Entries) {
    const filteredEntries = [];
    const next = traverseEntriesGenerator(Entries);
    let res = next.next();
    try {
        const tagsText = res.value.tags;
        if ([tags].indexOf(tags) >= 0) {
            filteredEntries.push(res.value);
        }
    } catch (err) {
    }
    while (!res.done) {
        res = next.next();
        try {
            const tagsText = res.value.tags;
            if ([tags].indexOf(tags) >= 0) {
                filteredEntries.push(res.value);
            }
        } catch (err) {
        }
    }
    return filteredEntries;
}

export function getEntriesTextsByTags(tags, Entries) {
    console.log("GETTING ENTRY TEXTS BY TAGS: ", tags);
    const entriesTexts = {};
    const next = traverseEntriesGenerator(Entries);
    let res = next.next();
    try {
        const tagsText = res.value.tags;
        if (tags.some(v => tagsText.includes(v))) {
            console.log("ADD ENTRY TAG: ", tagsText);
            entriesTexts[res.value.id] = res.value.strippedText;
        }
    } catch (err) {
    }
    while (!res.done) {
        res = next.next();
        try {
            const tagsText = res.value.tags;
            if (tags.some(v => tagsText.includes(v))) {
                entriesTexts[res.value.id] = res.value.strippedText;
            }
        } catch (err) {
        }
    }
    return entriesTexts;
}


export function getAllEntryTags(Entries) {
    let eTags = [];
    const next = traverseEntriesGenerator(Entries);
    let res = next.next();
    try {
        const tags = res.value.tags.split(', ');
        eTags = eTags.concat(tags);
    } catch (err) {
    }
    while (!res.done) {
        res = next.next();
        try {
            const tags = res.value.tags.split(', ');
            eTags = eTags.concat(tags);
        } catch (err) {
        }
    }
    eTags = eTags.filter(function (el) {
        return el !== null;
    });      
    eTags = eTags.filter(function (el) {
        return el !== '';
    });      
    return Array.from(new Set(eTags)); // Remove duplicate tags
}