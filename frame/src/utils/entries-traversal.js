/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */

export default function traverseEntriesById(id, Entries) {
    try {
        for (let i=0;i<Entries.length;i++) {
            if (Entries[i].id === id) {
                return Entries[i];
            }
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
}