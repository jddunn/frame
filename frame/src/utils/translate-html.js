/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */

import { getCurrentContent,
         convertToHTML, convertFromHTML } from 'draft-convert';

import { EditorState } from 'draft-js';

export function getHTMLFromContent(editorState) {
    const html = convertToHTML(editorState.getCurrentContent());
    return html;
}

export function getContentFromHTML(html) {
    console.log(html);
    const blocks = convertFromHTML(html);
    console.log(blocks);
    const editorState = EditorState.createWithContent(blocks);
    console.log("EDITOR STATE: ", editorState);
    return editorState;
}

export function HTMLToText(html) {
     // Set the HTML content with the providen
    // We only use this because we assume the user won't execute malicious code inside his notebook
    //  const tempDivElement = document.createElement("div");
    //  tempDivElement.innerHTML = html;
    // return tempDivElement.textContent.replace(reg, " ") || tempDivElement.innerText.replace(reg, " ") || "";
    let text = "";
    const reg = /(<([^>]+)>)/ig;
    text = html.replace(reg, " ")
    return text;
}
