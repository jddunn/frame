'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _onTab = require('./onTab');

var _onTab2 = _interopRequireDefault(_onTab);

var _onUpArrow = require('./onUpArrow');

var _onUpArrow2 = _interopRequireDefault(_onUpArrow);

var _handlePastedText = require('./handlePastedText');

var _handlePastedText2 = _interopRequireDefault(_handlePastedText);

var _handleReturn = require('./handleReturn');

var _handleReturn2 = _interopRequireDefault(_handleReturn);

var _handleKeyCommand = require('./handleKeyCommand');

var _handleKeyCommand2 = _interopRequireDefault(_handleKeyCommand);

var _handleBeforeInput = require('./handleBeforeInput');

var _handleBeforeInput2 = _interopRequireDefault(_handleBeforeInput);

var _blockRendererFn = require('./blockRendererFn');

var _blockRendererFn2 = _interopRequireDefault(_blockRendererFn);

var _blockStyleFn = require('./blockStyleFn');

var _blockStyleFn2 = _interopRequireDefault(_blockStyleFn);

var _keyBindingFn = require('./keyBindingFn');

var _keyBindingFn2 = _interopRequireDefault(_keyBindingFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultPlugins = {
  onTab: _onTab2.default,
  onUpArrow: _onUpArrow2.default,
  handlePastedText: _handlePastedText2.default,
  handleReturn: _handleReturn2.default,
  handleKeyCommand: _handleKeyCommand2.default,
  handleBeforeInput: _handleBeforeInput2.default,
  blockRendererFn: _blockRendererFn2.default,
  blockStyleFn: _blockStyleFn2.default,
  keyBindingFn: _keyBindingFn2.default
};

exports.default = defaultPlugins;