'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _draftJs = require('draft-js');

var _addbutton = require('./components/addbutton');

var _addbutton2 = _interopRequireDefault(_addbutton);

var _toolbar = require('./components/toolbar');

var _toolbar2 = _interopRequireDefault(_toolbar);

var _customrenderer = require('./components/customrenderer');

var _customrenderer2 = _interopRequireDefault(_customrenderer);

var _image = require('./components/sides/image');

var _image2 = _interopRequireDefault(_image);

var _LinkEditComponent = require('./components/LinkEditComponent');

var _LinkEditComponent2 = _interopRequireDefault(_LinkEditComponent);

var _model = require('./model');

var _constants = require('./util/constants');

var _beforeinput = require('./util/beforeinput');

var _beforeinput2 = _interopRequireDefault(_beforeinput);

var _keybinding = require('./util/keybinding');

var _keybinding2 = _interopRequireDefault(_keybinding);

var _customstylemap = require('./util/customstylemap');

var _customstylemap2 = _interopRequireDefault(_customstylemap);

var _rendermap = require('./util/rendermap');

var _rendermap2 = _interopRequireDefault(_rendermap);

var _blockStyleFn = require('./util/blockStyleFn');

var _blockStyleFn2 = _interopRequireDefault(_blockStyleFn);

var _handlers = require('./handlers/');

var _handlers2 = _interopRequireDefault(_handlers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var merge = function merge(obj2, obj3) {
  var res = {};
  // eslint-disable-next-line
  for (var prop in obj2) {
    if (Object.hasOwnProperty.call(obj2, prop)) {
      res[prop] = obj2[prop];
    }
  }
  // eslint-disable-next-line
  for (var _prop in obj3) {
    if (Object.hasOwnProperty.call(obj3, _prop)) {
      res[_prop] = obj3[_prop];
    }
  }
  return res;
};

var createEditor = function createEditor() {
  var defHandlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var handlers = merge(_handlers2.default, defHandlers);

  var MediumDraftEditor = function (_React$Component) {
    _inherits(MediumDraftEditor, _React$Component);

    function MediumDraftEditor(props) {
      _classCallCheck(this, MediumDraftEditor);

      var _this = _possibleConstructorReturn(this, (MediumDraftEditor.__proto__ || Object.getPrototypeOf(MediumDraftEditor)).call(this, props));

      _this.setLink = function (url) {
        var editorState = _this.props.editorState;

        var selection = editorState.getSelection();
        var content = editorState.getCurrentContent();
        var entityKey = null;
        var newUrl = url;
        if (url !== '') {
          if (url.indexOf('http') === -1) {
            if (url.indexOf('@') >= 0) {
              newUrl = 'mailto:' + newUrl;
            } else {
              newUrl = 'http://' + newUrl;
            }
          }
          var contentWithEntity = content.createEntity(_constants.Entity.LINK, 'MUTABLE', { url: newUrl });
          editorState = _draftJs.EditorState.push(editorState, contentWithEntity, 'create-entity');
          entityKey = contentWithEntity.getLastCreatedEntityKey();
        }
        // const scrollY = window.scrollY;
        _this.onChange(_draftJs.RichUtils.toggleLink(editorState, selection, entityKey), _this.focus);
      };

      _this._reposition = function (oldScrollY) {
        var scrollY = window.scrollY;
        if (scrollY !== oldScrollY) {
          setTimeout(function () {
            window.scrollTo(0, oldScrollY);
          }, 0);
        }
      };

      _this._getCommonData = function () {
        return {
          getEditorState: _this.getEditorState,
          setEditorState: _this.onChange,
          focus: _this.focus,
          toolbar: _this.toolbar,
          editor: _this._editorNode,
          reposition: _this._reposition,
          continuousBlocks: _this.props.continuousBlocks,
          disableToolbar: _this.props.disableToolbar,
          beforeInput: _this.props.beforeInput,
          stringToTypeMap: _this.props.stringToTypeMap,
          rendererFn: _this.props.rendererFn,
          blockStyleFn: _this.props.blockStyleFn,
          keyBindingFn: _this.props.keyBindingFn
        };
      };

      _this.removeLink = function (blockKey, entityKey) {
        var editorState = _this.props.editorState;

        var content = editorState.getCurrentContent();
        var block = content.getBlockForKey(blockKey);
        var oldSelection = editorState.getSelection();
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
          var newEditorState = _draftJs.EditorState.forceSelection(_draftJs.RichUtils.toggleLink(editorState, selection, null), oldSelection);
          _this.onChange(newEditorState, _this.focus);
        });
      };

      _this.editLinkAfterSelection = function (blockKey) {
        var entityKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (entityKey === null) {
          return;
        }
        var editorState = _this.props.editorState;

        var content = editorState.getCurrentContent();
        var block = content.getBlockForKey(blockKey);
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
          var newEditorState = _draftJs.EditorState.forceSelection(editorState, selection);
          _this.onChange(newEditorState);
          setTimeout(function () {
            if (_this.toolbar) {
              _this.toolbar.handleLinkInput(null, true);
            }
          }, 100);
        });
      };

      _this._editorRefCb = function (ref) {
        _this._editorNode = ref;
      };

      _this._toolbaRefCb = function (ref) {
        _this.toolbar = ref;
      };

      _this.focus = function () {
        return _this._editorNode.focus();
      };
      _this.onChange = function (editorState, cb) {
        _this.props.onChange(editorState, cb);
      };

      _this.getEditorState = function () {
        return _this.props.editorState;
      };

      _this.toggleBlockType = _this._toggleBlockType.bind(_this);
      _this.toggleInlineStyle = _this._toggleInlineStyle.bind(_this);

      _this.handlers = {};

      // eslint-disable-next-line

      var _loop = function _loop(handler) {
        // eslint-disable-next-line
        if (handlers.hasOwnProperty(handler)) {
          _this.handlers[handler] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return handlers[handler].apply(handlers, args.concat([_this._getCommonData()]));
          };
        }
      };

      for (var handler in handlers) {
        _loop(handler);
      }
      return _this;
    }

    /**
     * Adds a hyperlink on the selected text with some basic checks.
     */


    _createClass(MediumDraftEditor, [{
      key: 'configureToolbarBlockOptions',


      /**
       * Override which text modifications are available according BLOCK_BUTTONS style property.
       * Defaults all of them if no toolbarConfig.block passed:
       *   block: ['ordered-list-item', 'unordered-list-item', 'blockquote', 'header-three', 'todo'],
       * Example parameter: toolbarConfig = {
       *   block: ['ordered-list-item', 'unordered-list-item'],
       *   inline: ['BOLD', 'ITALIC', 'UNDERLINE', 'hyperlink'],
       * };
       */
      value: function configureToolbarBlockOptions(toolbarConfig) {
        return toolbarConfig && toolbarConfig.block ? toolbarConfig.block.map(function (type) {
          return _toolbar.BLOCK_BUTTONS.find(function (button) {
            return button.style === type;
          });
        }).filter(function (button) {
          return button !== undefined;
        }) : this.props.blockButtons;
      }

      /**
       * Override which text modifications are available according INLINE_BUTTONS style property.
       * CASE SENSITIVE. Would be good clean up to lowercase inline styles consistently.
       * Defaults all of them if no toolbarConfig.inline passed:
       *   inline: ['BOLD', 'ITALIC', 'UNDERLINE', 'hyperlink', 'HIGHLIGHT'],
       * Example parameter: toolbarConfig = {
       *   block: ['ordered-list-item', 'unordered-list-item'],
       *   inline: ['BOLD', 'ITALIC', 'UNDERLINE', 'hyperlink'],
       * };
       */

    }, {
      key: 'configureToolbarInlineOptions',
      value: function configureToolbarInlineOptions(toolbarConfig) {
        return toolbarConfig && toolbarConfig.inline ? toolbarConfig.inline.map(function (type) {
          return _toolbar.INLINE_BUTTONS.find(function (button) {
            return button.style === type;
          });
        }).filter(function (button) {
          return button !== undefined;
        }) : this.props.inlineButtons;
      }

      /*
      The function documented in `draft-js` to be used to toggle block types (mainly
      for some key combinations handled by default inside draft-js).
      */

    }, {
      key: '_toggleBlockType',
      value: function _toggleBlockType(blockType) {
        var type = _draftJs.RichUtils.getCurrentBlockType(this.props.editorState);
        if (type.indexOf(_constants.Block.ATOMIC + ':') === 0) {
          return;
        }
        this.onChange(_draftJs.RichUtils.toggleBlockType(this.props.editorState, blockType));
      }

      /*
      The function documented in `draft-js` to be used to toggle inline styles of selection (mainly
      for some key combinations handled by default inside draft-js).
      */

    }, {
      key: '_toggleInlineStyle',
      value: function _toggleInlineStyle(inlineStyle) {
        this.onChange(_draftJs.RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
      }
    }, {
      key: 'render',


      /**
       * Renders the `Editor`, `Toolbar` and the side `AddButton`.
       */
      value: function render() {
        var _props = this.props,
            editorState = _props.editorState,
            editorEnabled = _props.editorEnabled,
            disableToolbar = _props.disableToolbar,
            showLinkEditToolbar = _props.showLinkEditToolbar,
            toolbarConfig = _props.toolbarConfig;

        var showAddButton = editorEnabled;
        var editorClass = 'md-RichEditor-editor' + (!editorEnabled ? ' md-RichEditor-readonly' : '');
        var isCursorLink = false;
        if (editorEnabled && showLinkEditToolbar) {
          isCursorLink = (0, _model.isCursorBetweenLink)(editorState);
        }
        var blockButtons = this.configureToolbarBlockOptions(toolbarConfig);
        var inlineButtons = this.configureToolbarInlineOptions(toolbarConfig);
        return _react2.default.createElement(
          'div',
          { className: 'md-RichEditor-root' },
          _react2.default.createElement(
            'div',
            { className: editorClass },
            _react2.default.createElement(_draftJs.Editor, _extends({
              ref: this._editorRefCb
            }, this.props, this.handlers, {
              editorState: editorState,
              onChange: this.onChange,
              blockRenderMap: this.props.blockRenderMap,
              customStyleMap: this.props.customStyleMap,
              readOnly: !editorEnabled,
              placeholder: this.props.placeholder,
              spellCheck: editorEnabled && this.props.spellCheck
            })),
            this.props.sideButtons.length > 0 && showAddButton && _react2.default.createElement(_addbutton2.default, {
              editorState: editorState,
              getEditorState: this.getEditorState,
              setEditorState: this.onChange,
              focus: this.focus,
              sideButtons: this.props.sideButtons
            }),
            !disableToolbar && _react2.default.createElement(_toolbar2.default, {
              ref: this._toolbaRefCb,
              editorNode: this._editorNode,
              editorState: editorState,
              toggleBlockType: this.toggleBlockType,
              toggleInlineStyle: this.toggleInlineStyle,
              editorEnabled: editorEnabled,
              setLink: this.setLink,
              focus: this.focus,
              blockButtons: blockButtons,
              inlineButtons: inlineButtons
            }),
            isCursorLink && _react2.default.createElement(_LinkEditComponent2.default, _extends({}, isCursorLink, {
              editorState: editorState,
              removeLink: this.removeLink,
              editLink: this.editLinkAfterSelection
            }))
          )
        );
      }
    }]);

    return MediumDraftEditor;
  }(_react2.default.Component);

  MediumDraftEditor.propTypes = {
    beforeInput: _propTypes2.default.func,
    keyBindingFn: _propTypes2.default.func,
    customStyleMap: _propTypes2.default.object,
    blockStyleFn: _propTypes2.default.func,
    rendererFn: _propTypes2.default.func,
    editorEnabled: _propTypes2.default.bool,
    spellCheck: _propTypes2.default.bool,
    stringToTypeMap: _propTypes2.default.object,
    blockRenderMap: _propTypes2.default.object,
    blockButtons: _propTypes2.default.arrayOf(_propTypes2.default.shape({
      label: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element, _propTypes2.default.object]),
      style: _propTypes2.default.string.isRequired,
      icon: _propTypes2.default.string,
      description: _propTypes2.default.string
    })),
    inlineButtons: _propTypes2.default.arrayOf(_propTypes2.default.shape({
      label: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element, _propTypes2.default.object]),
      style: _propTypes2.default.string.isRequired,
      icon: _propTypes2.default.string,
      description: _propTypes2.default.string
    })),
    placeholder: _propTypes2.default.string,
    continuousBlocks: _propTypes2.default.arrayOf(_propTypes2.default.string),
    sideButtons: _propTypes2.default.arrayOf(_propTypes2.default.shape({
      title: _propTypes2.default.string.isRequired,
      component: _propTypes2.default.func.isRequired
    })),
    editorState: _propTypes2.default.object.isRequired,
    onChange: _propTypes2.default.func.isRequired,
    handleKeyCommand: _propTypes2.default.func,
    handleReturn: _propTypes2.default.func,
    handlePastedText: _propTypes2.default.func,
    disableToolbar: _propTypes2.default.bool,
    showLinkEditToolbar: _propTypes2.default.bool,
    toolbarConfig: _propTypes2.default.object
  };
  MediumDraftEditor.defaultProps = {
    beforeInput: _beforeinput2.default,
    customStyleMap: _customstylemap2.default,
    rendererFn: _customrenderer2.default,
    keyBindingFn: _keybinding2.default,
    blockStyleFn: _blockStyleFn2.default,
    editorEnabled: true,
    spellCheck: true,
    stringToTypeMap: _beforeinput.StringToTypeMap,
    blockRenderMap: _rendermap2.default,
    blockButtons: _toolbar.BLOCK_BUTTONS,
    inlineButtons: _toolbar.INLINE_BUTTONS,
    placeholder: 'Write your story...',
    continuousBlocks: [_constants.Block.UNSTYLED, _constants.Block.BLOCKQUOTE, _constants.Block.OL, _constants.Block.UL, _constants.Block.CODE, _constants.Block.TODO],
    sideButtons: [{
      title: 'Image',
      component: _image2.default
    }],
    disableToolbar: false,
    showLinkEditToolbar: true,
    toolbarConfig: {}
  };


  return MediumDraftEditor;
};

exports.default = createEditor;