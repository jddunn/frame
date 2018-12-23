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
    const blocks = convertFromHTML(html);
    const editorState = EditorState.createWithContent(blocks);
    return editorState;
}


export function HTMLToText(html) {
    let stripped = html;
    stripped = stripped.split("<p>").join("\r\r\n\n");
    const reg = /(<([^>]+)>)/ig;
    stripped = stripped.replace(reg, "")

    // stripped = stripped.replace(/<br>/g, "$br$");
    // stripped = stripped.replace(/(?:\r\n|\r|\n)/g, '$br$');
    // const tmp = document.createElement("DIV");
    // const.innerHTML = html;
    // html = tmp.textContent || tmp.innerText;
    // stripped = stripped.replace(/\$br\$/g, "<br>");
    return stripped;
}

// export function HTMLToText(html) {
    // let text = "";
    // const reg = /(<([^>]+)>)/ig;
    // text = html.replace(reg, " ")
    // return text;
// }
