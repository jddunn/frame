'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.handleTabForListItems = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = require('draft-js');

var MAX_NESTING_LEVEL = 2;

var handleTabForListItems = exports.handleTabForListItems = function handleTabForListItems(e, _ref) {
  var getEditorState = _ref.getEditorState;

  var editorState = getEditorState();
  var newEditorState = _draftJs.RichUtils.onTab(e, editorState, MAX_NESTING_LEVEL);
  if (newEditorState === editorState) {
    return editorState;
  }
  return newEditorState;
};

var handlerList = exports.handlerList = [handleTabForListItems];

var onTab = function onTab(e, options) {
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

exports.default = onTab;