"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var customRendererFn = exports.customRendererFn = function customRendererFn(contentBlock, _ref) {
  var rendererFn = _ref.rendererFn,
      getEditorState = _ref.getEditorState,
      setEditorState = _ref.setEditorState;

  var customRenderer = rendererFn(setEditorState, getEditorState);
  return customRenderer(contentBlock);
};

var handlerList = exports.handlerList = [customRendererFn];

var blockRendererFn = function blockRendererFn(contentBlock, options) {
  var handlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : handlerList;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var handler = _step.value;

      var res = handler(contentBlock, options);
      if (res) {
        return res;
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

  return null;
};

exports.default = blockRendererFn;