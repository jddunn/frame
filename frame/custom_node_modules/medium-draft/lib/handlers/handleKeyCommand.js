'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handleInlineCommand = exports.handleBlockCommand = exports.handleUnlink = exports.handleShowLinkInput = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Handles custom commands based on various key combinations. First checks
                                                                                                                                                                                                                                                                   * for some built-in commands. If found, that command's function is apllied and returns.
                                                                                                                                                                                                                                                                   * If not found, it checks whether parent component handles that command or not.
                                                                                                                                                                                                                                                                   * Some of the internal commands are:
                                                                                                                                                                                                                                                                   * - showlinkinput -> Opens up the link input tooltip if some text is selected.
                                                                                                                                                                                                                                                                   * - add-new-block -> Adds a new block at the current cursor position.
                                                                                                                                                                                                                                                                   * - changetype:block-type -> If the command starts with `changetype:` and
                                                                                                                                                                                                                                                                   *   then succeeded by the block type, the current block will be converted to that particular type.
                                                                                                                                                                                                                                                                   * - toggleinline:inline-type -> If the command starts with `toggleinline:` and
                                                                                                                                                                                                                                                                   *   then succeeded by the inline type, the current selection's inline type will be
                                                                                                                                                                                                                                                                   *   toggled.
                                                                                                                                                                                                                                                                   */


var _draftJs = require('draft-js');

var _constants = require('../util/constants');

var _model = require('../model/');

var handleShowLinkInput = exports.handleShowLinkInput = function handleShowLinkInput(command, _ref) {
  var getEditorState = _ref.getEditorState,
      disableToolbar = _ref.disableToolbar,
      toolbar = _ref.toolbar;

  var editorState = getEditorState();
  if (command !== _constants.KEY_COMMANDS.showLinkInput()) {
    return editorState;
  }
  if (disableToolbar || !toolbar) {
    return editorState;
  }
  var isCursorLink = (0, _model.isCursorBetweenLink)(editorState);
  if (!isCursorLink) {
    toolbar.handleLinkInput(null, true);
    return editorState;
  }
  var content = editorState.getCurrentContent();
  var blockKey = isCursorLink.blockKey,
      entityKey = isCursorLink.entityKey;

  // if (entityKey === null) {
  //   return editorState;
  // }

  var block = content.getBlockForKey(blockKey);
  var newEditorState = editorState;
  block.findEntityRanges(function (character) {
    var eKey = character.getEntity();
    return eKey === entityKey;
  }, function (start, end) {
    var selection = new _draftJs.SelectionState({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: start,
      focusOffset: end
    });
    newEditorState = _draftJs.EditorState.forceSelection(editorState, selection);
  });

  if (newEditorState !== editorState) {
    setTimeout(function () {
      toolbar.handleLinkInput(null, true);
    }, 100);
  }
  return newEditorState;
};

var handleUnlink = exports.handleUnlink = function handleUnlink(command, _ref2) {
  var getEditorState = _ref2.getEditorState;

  var editorState = getEditorState();

  if (command !== _constants.KEY_COMMANDS.unlink()) {
    return editorState;
  }
  var isCursorLink = (0, _model.isCursorBetweenLink)(editorState);
  if (!isCursorLink) {
    return editorState;
  }

  var blockKey = isCursorLink.blockKey,
      entityKey = isCursorLink.entityKey;

  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);
  var oldSelection = editorState.getSelection();
  var newEditorState = editorState;

  block.findEntityRanges(function (character) {
    var eKey = character.getEntity();
    return eKey === entityKey;
  }, function (start, end) {
    var selection = new _draftJs.SelectionState({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: start,
      focusOffset: end
    });
    newEditorState = _draftJs.EditorState.forceSelection(_draftJs.RichUtils.toggleLink(editorState, selection, null), oldSelection);
  });
  return newEditorState;
};

var handleBlockCommand = exports.handleBlockCommand = function handleBlockCommand(command, _ref3) {
  var getEditorState = _ref3.getEditorState;

  var editorState = getEditorState();
  if (command.indexOf(_constants.KEY_COMMANDS.changeType()) !== 0) {
    return editorState;
  }
  var block = (0, _model.getCurrentBlock)(editorState);
  var currentBlockType = block.getType();

  if (currentBlockType === _constants.Block.ATOMIC) {
    return editorState;
  }

  var newBlockType = command.split(':')[1];
  if (currentBlockType === _constants.Block.BLOCKQUOTE && newBlockType === _constants.Block.CAPTION) {
    newBlockType = _constants.Block.BLOCKQUOTE_CAPTION;
  } else if (currentBlockType === _constants.Block.BLOCKQUOTE_CAPTION && newBlockType === _constants.Block.CAPTION) {
    newBlockType = _constants.Block.BLOCKQUOTE;
  }
  return _draftJs.RichUtils.toggleBlockType(editorState, newBlockType);
};

var handleInlineCommand = exports.handleInlineCommand = function handleInlineCommand(command, _ref4) {
  var getEditorState = _ref4.getEditorState;

  var editorState = getEditorState();
  if (command.indexOf(_constants.KEY_COMMANDS.toggleInline()) !== 0) {
    return editorState;
  }
  var inlineStyle = command.split(':')[1];
  return _draftJs.RichUtils.toggleInlineStyle(editorState, inlineStyle);
};

var handlerList = exports.handlerList = [handleShowLinkInput, handleUnlink, handleBlockCommand, handleInlineCommand];

var handleKeyCommand = function handleKeyCommand(command, es, options) {
  var handlers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : handlerList;

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

      editorState = handler(command, _extends({}, options, {
        getEditorState: _getEs
      }));
      if (editorState !== originalEs) {
        options.setEditorState(editorState, options.focus);
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

  if (behavior === _constants.NOT_HANDLED) {
    var newState = _draftJs.RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      options.setEditorState(newState);
    }
  }
  return behavior;
};

exports.default = handleKeyCommand;