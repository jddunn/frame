'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlerList = exports.customKeyBindingFn = undefined;

var _draftJs = require('draft-js');

var customKeyBindingFn = exports.customKeyBindingFn = function customKeyBindingFn(e, _ref) {
  var kbFn = _ref.keyBindingFn;
  return kbFn(e);
};

var handlerList = exports.handlerList = [customKeyBindingFn];

exports.default = function (e, options) {
  var handlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : handlerList;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var handler = _step.value;

      var res = handler(e, options);
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

  return (0, _draftJs.getDefaultKeyBinding)(e);
};