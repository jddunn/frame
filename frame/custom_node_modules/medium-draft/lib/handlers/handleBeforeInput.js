'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handlerUsingBeforeInput = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * This function is responsible for emitting various commands based on various key combos.
                                                                                                                                                                                                                                                                   */

var _constants = require('../util/constants');

var handlerUsingBeforeInput = exports.handlerUsingBeforeInput = function handlerUsingBeforeInput(str, _ref) {
  var getEditorState = _ref.getEditorState,
      beforeInput = _ref.beforeInput,
      stringToTypeMap = _ref.stringToTypeMap;

  var editorState = getEditorState();
  var onChange = function onChange(es) {
    editorState = es;
  };
  var behavior = beforeInput(editorState, str, onChange, stringToTypeMap);
  if (behavior === _constants.HANDLED) {
    return editorState;
  }
  return getEditorState();
};

var handlerList = exports.handlerList = [handlerUsingBeforeInput];

var handleBeforeInput = function handleBeforeInput(str, es, options) {
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

      editorState = handler(str, _extends({}, options, {
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

exports.default = handleBeforeInput;