/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */
/* eslint prefer-default-export: 0 */

import nlp from 'compromise';

export default function parseTextForPeople(text) {
    let people = [];
    people = nlp(text).people().out('topk');
    return people;
}
