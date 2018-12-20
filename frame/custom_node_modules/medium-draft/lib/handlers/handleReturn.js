'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handleReturnInNonContinuousBlock = exports.handleReturnInEmptyBlocks = exports.handleReturnFromAtomicBlock = exports.handleSoftReturn = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * By default, it handles return key for inserting soft breaks (BRs in HTML) and
                                                                                                                                                                                                                                                                   * also instead of inserting a new empty block after current empty block, it first check
                                                                                                                                                                                                                                                                   * whether the current block is of a type other than `unstyled`. If yes, current block is
                                                                                                                                                                                                                                                                   * simply converted to an unstyled empty block. If RETURN is pressed on an unstyled block
                                                                                                                                                                                                                                                                   * default behavior is executed.
                                                                                                                                                                                                                                                                   */

var _draftJs = require('draft-js');

var _isSoftNewlineEvent = require('draft-js/lib/isSoftNewlineEvent');

var _isSoftNewlineEvent2 = _interopRequireDefault(_isSoftNewlineEvent);

var _constants = require('../util/constants');

var _model = require('../model/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add a line break within the block if Shift+ENTER is pressed
 */
var handleSoftReturn = exports.handleSoftReturn = function handleSoftReturn(e, _ref) {
  var getEditorState = _ref.getEditorState;

  var editorState = getEditorState();
  if (!(0, _isSoftNewlineEvent2.default)(e)) {
    return editorState;
  }
  return _draftJs.RichUtils.insertSoftNewline(editorState);
};

/**
 * Add a new unstyled block if RETURN is pressed from within ATOMIC block.
 */
var handleReturnFromAtomicBlock = exports.handleReturnFromAtomicBlock = function handleReturnFromAtomicBlock(e, _ref2) {
  var getEditorState = _ref2.getEditorState;

  var editorState = getEditorState();
  if (e.altKey || e.metaKey || e.ctrlKey) {
    return editorState;
  }
  var currentBlock = (0, _model.getCurrentBlock)(editorState);
  var blockType = currentBlock.getType();
  if (blockType.indexOf(_constants.Block.ATOMIC) !== 0) {
    return editorState;
  }
  return (0, _model.addNewBlockAt)(editorState, currentBlock.getKey());
};

/**
 * If RETURN is pressed in one of empty BLOCKQUOTE, UL, OL, CAPTIONs,
 * TODOs or HEADINGs blocks, reset the block type to unstyled.
 */
var handleReturnInEmptyBlocks = exports.handleReturnInEmptyBlocks = function handleReturnInEmptyBlocks(e, _ref3) {
  var getEditorState = _ref3.getEditorState;

  var editorState = getEditorState();
  var currentBlock = (0, _model.getCurrentBlock)(editorState);
  if (currentBlock.getLength() !== 0) {
    return editorState;
  }

  var blockType = currentBlock.getType();

  switch (blockType) {
    case _constants.Block.UL:
    case _constants.Block.OL:
    case _constants.Block.BLOCKQUOTE:
    case _constants.Block.BLOCKQUOTE_CAPTION:
    case _constants.Block.CAPTION:
    case _constants.Block.TODO:
    case _constants.Block.H2:
    case _constants.Block.H3:
    case _constants.Block.H1:
      return (0, _model.resetBlockWithType)(editorState, _constants.Block.UNSTYLED);
    default:
      return editorState;
  }
};

/**
 * By default, RETURN press when the cursor is at the end of a block,
 * adds a new block of the same type. So, if current block type is not in
 * `continuousBlocks`, add a new UNSTYLED block instead.
 */
var handleReturnInNonContinuousBlock = exports.handleReturnInNonContinuousBlock = function handleReturnInNonContinuousBlock(e, _ref4) {
  var getEditorState = _ref4.getEditorState,
      _ref4$continuousBlock = _ref4.continuousBlocks,
      continuousBlocks = _ref4$continuousBlock === undefined ? [] : _ref4$continuousBlock;

  var editorState = getEditorState();
  var selection = editorState.getSelection();
  if (!selection.isCollapsed()) {
    return editorState;
  }
  var currentBlock = (0, _model.getCurrentBlock)(editorState);
  if (currentBlock.getLength() !== selection.getStartOffset()) {
    return editorState;
  }
  var blockType = currentBlock.getType();
  if (continuousBlocks.indexOf(blockType) >= 0) {
    return editorState;
  }
  return (0, _model.addNewBlockAt)(editorState, currentBlock.getKey());
};

var handlerList = exports.handlerList = [handleSoftReturn, handleReturnFromAtomicBlock, handleReturnInEmptyBlocks, handleReturnInNonContinuousBlock];

var handleReturn = function handleReturn(e, es, options) {
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

      editorState = handler(e, _extends({}, options, {
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

exports.default = handleReturn;