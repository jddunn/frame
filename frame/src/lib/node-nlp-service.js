/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */
/* eslint prefer-default-export: 0 */
/* eslint no-useless-escape: 0 */
/* eslint radix: 0 */
/* eslint no-use-before-define: 0 */

import nlp from 'compromise';

const sumBasic = require('node-sumbasic');

export function summarizeParagraphs(text) {
    const splitParagraphs = text.split("/\r\n|\n|\r/");
    const splitSummaries = []
    if (splitParagraphs.length > 0) {
        for (let i=0; i<splitParagraphs.length; i++) {
            const docs = [];
            const sentCount = countSentences(splitParagraphs[i]);
            docs.push(splitParagraphs[i]);
            const splitRes = sumBasic(docs, parseInt(sentCount / 3), parseInt(sentCount / 5));
            splitSummaries.push(splitRes);
        }
    } 
    return splitSummaries;
}

export function isVowel(c) {
    if      ((c === 'a') || (c === 'A')) { return true; }
    else if ((c === 'e') || (c === 'E')) { return true; }
    else if ((c === 'i') || (c === 'I')) { return true; }
    else if ((c === 'o') || (c === 'O')) { return true; }
    else if ((c === 'u') || (c === 'U')) { return true; }
    else if ((c === 'y') || (c === 'Y')) { return true; }
    return false;
}

export function countSyllables(word) {
    let syl = 0;
    let vowel = false;
    for (let i = 0; i < word.length; i++) {
      if (isVowel(word.charAt(i)) && (vowel === false)) {
        vowel = true;
        syl++;
      } else if (isVowel(word.charAt(i)) && (vowel === true)) {
        vowel = true;
      } else {
        vowel = false;
      }
    }
    const tempChar = word.charAt(word.length-1);
    if ((tempChar === 'e' || tempChar === 'E') && syl !== 1) {
      syl--;
    }
    return syl;
  }

export function countTotalSyllables(text) {
    let newText = text;
    newText = newText.replace(/\n/g,' '); // newlines to space
    newText = newText.replace(/(^\s*)|(\s*$)/gi,''); // remove spaces from start + end
    newText = newText.replace(/[ ]{2,}/gi,' '); // 2 or more spaces to 1
    const tokens = newText.split(' ');
    let totalSyllableCount = 0;
    for (let i=0; i<tokens.length; i++) {
        const word = tokens[i];
        totalSyllableCount += countSyllables(word);
    }
    return totalSyllableCount;
}

export function countSentences(text) {
    const sentencesByPunct = text.split(/((?:\S[^\.\?\!]*)[\.\?\!]*)/g);
    const sentencesSplitByLines = text.split(/\r?\n/);
    return sentencesByPunct.length + sentencesSplitByLines.length;
}

export function getFleschReadability(totalSyllables, totalWords, totalSentences) {
    const f1 = 206.835;
    const f2 = 84.6;
    const f3 = 1.015;
    const r1 = totalSyllables / totalWords;
    const r2 = totalWords / totalSentences;
    const flesch = f1 - (f2 * r1) - (f3 * r2);
    return flesch;
}

export function countWords(text) {
    let newText = text;
    newText = newText.replace(/\n/g,' '); // newlines to space
    newText = newText.replace(/(^\s*)|(\s*$)/gi,''); // remove spaces from start + end
    newText = newText.replace(/[ ]{2,}/gi,' '); // 2 or more spaces to 1
    return newText.split(' ').length; 
}

export function countChars(text) {
    let charCount = 0;
    let newText = '';
    newText = text.trim();
    charCount = newText.length;
    return charCount;
}

export function parseTextForPeople(text) {
    return(nlp(text).people().slice(0, 50).out('frequency'));
}

export function parseTextForPlaces(text) {
    return(nlp(text).places().slice(0, 50).out('frequency'));
}

export function parseTextForPhoneNumbers(text) {
    return(nlp(text).phoneNumbers().slice(0, 50).out('frequency'));
}

export function parseTextForOrganizations(text) {
    return(nlp(text).organizations().slice(0, 50).out('frequency'));
}

export function parseTextForHashtags(text) {
    return(nlp(text).hashTags().slice(0, 50).out('frequency'));
}

export function parseTextForQuestions(text) {
    return(nlp(text).questions().slice(0, 50).out('frequency'));
}

export function parseTextForQuotes(text) {
    return(nlp(text).quotations().slice(0, 50).out('frequency'));
}

export function parseTextForTopics(text) {
    // return(nlp(text).topics().out('topk'));
    return(nlp(text).topics().slice(0, 30).out('frequency'));
}

export function parseTextForDates(text) {
    return(nlp('text').dates().slice(0, 50).out('frequency'));
}

export function parseTextForStatements(text) {
    return(nlp(text).statements().slice(0, 50).out('frequency'));
}

export function parseTextForURLs(text) {
    return(nlp(text).urls().slice(0, 50).out('frequency'));
}

export function parseTextForTerms(text) {
    return(nlp(text).terms().slice(0, 30).out('frequency'));
}

export function parseTextForBigrams(text) {
    return(nlp(text).ngrams().bigrams().slice(0, 20).out('frequency'));
}

export function parseTextForTrigrams(text) {
    return(nlp(text).ngrams().trigrams().slice(0, 20).out('frequency'));
}

export function normalizeText(text) {
    return (nlp(text).normalize());
}