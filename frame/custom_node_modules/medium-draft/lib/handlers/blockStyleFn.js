'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var inBuiltBlockStyleFn = exports.inBuiltBlockStyleFn = function inBuiltBlockStyleFn(block, _ref) {
  var bsFn = _ref.blockStyleFn;
  return bsFn(block);
};

var handlerList = exports.handlerList = [inBuiltBlockStyleFn];

var blockStyleFn = function blockStyleFn(block, options) {
  var handlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : handlerList;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var handler = _step.value;

      var res = handler(block, options);
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

  return 'md-block';
};

exports.default = blockStyleFn;