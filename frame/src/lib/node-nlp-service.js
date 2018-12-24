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
/* eslint no-nested-ternary: 0 */
/* eslint guard-for-in: 0 */
/* eslint no-restricted-syntax: 0 */
/* eslint no-param-reassign: 0 */
/* eslint prefer-destructuring: 0 */

import nlp from 'compromise';

const sumBasic = require('node-sumbasic');


export function filterCommonWords(arr) {
    const stopwords = [
        'and', 'And', 'the', 'The', "of", "Of", "there", "a", "A", "an", "An",
        "it's", "its", "Its", "It's", "It", "it", "to", "To", "for", "For",
        "from", "From", "/", " / ", "", " ", "be", "Be", "Are", "are", "is", "Is",
        "or", "Or"
    ];
    const res = arr.filter(function(el) {
        return !stopwords.includes(el);
    });
    return res;
}

export function getWordFrequency(text) {
    let words = text.replace(/[.]/g, '').split(/\s/);
    words = filterCommonWords(words);
    const freqMap = {};
    const res = [];
    words.forEach(function(w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });
    const sorted = [];
    for (const key in freqMap) {
        sorted.push([key, freqMap[key]]);
    }
    sorted.sort(function(a, b) {
        return a[1] - b[1];
    });
    const reversed = sorted.reverse().slice(0, 50);
    // const res = objectify(reversed);
    for (let i=0; i<reversed.length; i++) {
        const val = {word: reversed[i][0], count: reversed[i][1]};
        res.push(val);
    }
    return res;
}

export function summarizeParagraphs(text) {
    const splitParagraphs = text.split(/\n/g);
    const splitSummaries = []
    if (splitParagraphs.length > 0 && Array.isArray(splitParagraphs)) {
        for (let i=0; i<splitParagraphs.length; i++) {
            const docs = [];
            const sentCount = countSentences(splitParagraphs[i]);
            let splitRes = '';
            docs.push(splitParagraphs[i]);
            try {
                splitRes = sumBasic(docs, parseInt(sentCount / 3), parseInt(sentCount / 5));
            } catch (err) {
            }
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
    const sentencesSplit = text.split(/((?:\S[^/\r?\n/\.\?\!]*)[\.\?\!]*)/g);
    return sentencesSplit.length;
}

export function splitSentences(text) {
    const sentencesSplit = text.split(/((?:\S[^/\r?\n/\.\?\!]*)[\.\?\!]*)/g);
    return sentencesSplit;
}

export function splitWords(text) {
    const words = text.replace(/[.]/g, '').split(/\s/);
    return words;
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
    return(filterCommonWords(nlp(text).terms().slice(0, 30).out('frequency')));
}

export function parseTextForBigrams(text) {
    return(nlp(text).ngrams().bigrams().slice(0, 30).out('frequency'));
}

export function parseTextForTrigrams(text) {
    return(nlp(text).ngrams().trigrams().slice(0, 30).out('frequency'));
}

export function normalizeText(text) {
    return (nlp(text).normalize());
}

// function objectify(array) {
//     return array.reduce(function(p, c) {
//          p[c[0]] = c[1];
//          return p;
//     }, {});
// }