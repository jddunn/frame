'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handlePasteInImageCaption = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = require('draft-js');

var _model = require('../model');

var _constants = require('../util/constants');

/**
 * If current block is image and text is pasted, add that as plain
 * text at the cursor position.
 */
var handlePasteInImageCaption = exports.handlePasteInImageCaption = function handlePasteInImageCaption(text, html, es, _ref) {
  var getEditorState = _ref.getEditorState;

  var editorState = getEditorState();
  var currentBlock = (0, _model.getCurrentBlock)(editorState);
  if (currentBlock.getType() !== _constants.Block.IMAGE) {
    return editorState;
  }

  return _draftJs.EditorState.push(editorState, _draftJs.Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), text));
};

var handlerList = exports.handlerList = [handlePasteInImageCaption];

var handlePastedText = function handlePastedText(text, html, es, options) {
  var handlers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : handlerList;

  var originalEs = options.getEditorState();
  var editorState = originalEs;

  var _getEs = function _getEs() {
    return editorState;
  };
  var behavior = _constants.NOT_HANDLED;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var handler = _step.value;

      editorState = handler(text, html, es, _extends({}, options, {
        getEditorState: _getEs
      }));
      if (editorState !== originalEs) {
        options.setEditorState(editorState);
        behavior = _constants.HANDLED;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return behavior;
};

exports.default = handlePastedText;