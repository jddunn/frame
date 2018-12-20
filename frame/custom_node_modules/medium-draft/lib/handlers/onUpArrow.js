'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handleUpArrowAroundAtomicBlock = exports.handleUpArrowFromFirstAtomicBlock = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = require('draft-js');

var _immutable = require('immutable');

var _model = require('../model');

var _constants = require('../util/constants');

/**
 * If current block is atomic/image and it is also the first block,
 * and then UP arrow is pressed, insert an empty UNSTYLED block
 * above and focus to it.
 */
var handleUpArrowFromFirstAtomicBlock = exports.handleUpArrowFromFirstAtomicBlock = function handleUpArrowFromFirstAtomicBlock(e, _ref) {
  var getEditorState = _ref.getEditorState;

  var editorState = getEditorState();
  var currentBlock = (0, _model.getCurrentBlock)(editorState);
  var content = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var firstBlock = content.getFirstBlock();

  if (firstBlock.getKey() !== currentBlock.getKey() || firstBlock.getType().indexOf(_constants.Block.ATOMIC) !== 0) {
    return editorState;
  }
  // If cursor's block is the first block and it is of type atomic,
  // add a new empty block before it and add focus to it.
  e.preventDefault();
  var newBlock = new _draftJs.ContentBlock({
    type: _constants.Block.UNSTYLED,
    key: (0, _draftJs.genKey)()
  });
  var newBlockMap = (0, _immutable.OrderedMap)([[newBlock.getKey(), newBlock]]).concat(content.getBlockMap());

  var newContent = content.merge({
    blockMap: newBlockMap,
    selectionAfter: selection.merge({
      anchorKey: newBlock.getKey(),
      focusKey: newBlock.getKey(),
      anchorOffset: 0,
      focusOffset: 0,
      isBackward: false
    })
  });
  return _draftJs.EditorState.push(editorState, newContent, 'insert-characters');
};

/**
 * If current block is atomic and up arrow is pressed,
 * move the cursor to previous block.
 */
var handleUpArrowAroundAtomicBlock = exports.handleUpArrowAroundAtomicBlock = function handleUpArrowAroundAtomicBlock(e, _ref2) {
  var getEditorState = _ref2.getEditorState;

  var editorState = getEditorState();
  var currentBlock = (0, _model.getCurrentBlock)(editorState);

  if (currentBlock.getType().indexOf(_constants.Block.ATOMIC) !== 0) {
    return editorState;
  }

  var content = editorState.getCurrentContent();
  var blockBefore = content.getBlockBefore(currentBlock.getKey());
  var selection = editorState.getSelection();

  if (!blockBefore) {
    return editorState;
  }
  e.preventDefault();
  var newSelection = selection.merge({
    anchorKey: blockBefore.getKey(),
    focusKey: blockBefore.getKey(),
    anchorOffset: blockBefore.getLength(),
    focusOffset: blockBefore.getLength(),
    isBackward: false
  });
  return _draftJs.EditorState.forceSelection(editorState, newSelection);
};

var handlerList = exports.handlerList = [handleUpArrowFromFirstAtomicBlock, handleUpArrowAroundAtomicBlock];

var onUpArrow = function onUpArrow(e, options) {
  var handlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : handlerList;
  var getEditorState = options.getEditorState,
      setEditorState = options.setEditorState;

  var newEditorState = handlers.reduce(function (editorState, handler) {
    return handler(e, _extends({}, options, {
      getEditorState: function getEditorState() {
        return editorState;
      }
    }));
  }, getEditorState());
  setEditorState(newEditorState);
};

exports.default = onUpArrow;