// import React from 'react';

import 'draft-js/dist/Draft.css';
// eslint-disable-next-line
import 'hint.css/hint.min.css';

import '../src/index.scss';
import '../src/components/addbutton.scss';
import '../src/components/toolbar.scss';
import '../src/components/blocks/text.scss';
import '../src/components/blocks/atomic.scss';
import '../src/components/blocks/blockquotecaption.scss';
import '../src/components/blocks/caption.scss';
import '../src/components/blocks/todo.scss';
import '../src/components/blocks/image.scss';
// import { Editor, createEditorState } from '../src/';

import { createEditor } from '../src/';

const handleQuoteInput = (str, {
  getEditorState,
}) => {
  const editorState = getEditorState();
  return editorState;
};

const Editor = createEditor({
  handleBeforeInput: handleQuoteInput,
});

export default Editor;
