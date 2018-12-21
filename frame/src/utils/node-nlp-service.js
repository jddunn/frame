/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */
/* eslint prefer-default-export: 0 */

import nlp from 'compromise';

export function parseTextForPeople(text) {
    return(nlp(text).people().out('topk'));
}

export function parseTextForPlaces(text) {
    return(nlp(text).places().out('topk'));
}

export function parseTextForPhoneNumbers(text) {
    return(nlp(text).phoneNumbers().out('topk'));
}

export function parseTextForOrganizations(text) {
    return(nlp(text).organizations().out('topk'));
}

export function parseTextForHashtags(text) {
    return(nlp(text).hashTags().out('topk'));
}

export function parseTextForQuestions(text) {
    return(nlp(text).questions().out('topk'));
}

export function parseTextForQuotes(text) {
    return(nlp(text).quotations().out('topk'));
}

export function parseTextForTopics(text) {
    return(nlp(text).topics().out('topk'));
}

export function parseTextForStatements(text) {
    return(nlp(text).statements().out('topk'));
}

export function parseTextForURLs(text) {
    return(nlp(text).urls().out('topk'));
}

export function parseTextForTerms(text) {
    return(nlp(text).terms().out('topk'));
}

export function parseTextForBigrams(text) {
    return(nlp(text).ngrams().bigrams().out('topk'));
}

export function parseTextForTrigrams(text) {
    return(nlp(text).ngrams().trigrams().out('topk'));
}