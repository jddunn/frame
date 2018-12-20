/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */

export default function replaceEntry(entry, Entries) {
    const newEntries = Entries;
    for (let i=0; i<newEntries.length; i++) {
        if (newEntries[i].id === entry.id) {
            newEntries[i] = entry;
        }
    }
    return newEntries;
}
  