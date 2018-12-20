/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */

import { EditorState, getCurrentContent,
         convertToHTML, convertFromHTML } from 'draft-convert';

export function getHTMLFromContent(editorState) {
    const html = convertToHTML(editorState.getCurrentContent());
    return html;
}

export function getContentFromHTML(html) {
    const editorState = EditorState.createWithContent(convertFromHTML(html));
    return editorState;
}

// We only use this because we assume the user won't execute malicious code inside his notebook
export function HTMLToText(html) {
     // Set the HTML content with the providen
     const tempDivElement = document.createElement("div");
     tempDivElement.innerHTML = html;
     // Retrieve the text property of the element (cross-browser support)
     return tempDivElement.textContent || tempDivElement.innerText || "";
}