import nlp from 'compromise';

export function parseTextForPeople(text) {
    let people = [];
    people = nlp(text).people().out('topk');
    return people;
}
