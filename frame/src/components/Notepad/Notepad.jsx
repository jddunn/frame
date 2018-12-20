'use strict';
/* 
HTMLEditor, using Dante2 library, which clones Mediun's interface.
So the editor itself is also a live preview of the content.
 */
import React, { Component } from "react";
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { Select } from 'antd';
import { EditorState, ContentState, convertFromRaw, convertToRaw, convertFromHTML } from 'draft-js';
// TODO: Refactor out Editor and MEditor into different React components
import { Editor} from 'react-draft-wysiwyg'; // Full text editor
import { Editor as MEditor } from 'medium-draft'; // Medium-style text editor
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'medium-draft/lib/index.css';
import '../vendor/components/addbutton.scss';
import '../vendor/components/toolbar.scss';
import '../vendor/components/blocks/text.scss';
import '../vendor/components/blocks/atomic.scss';
import '../vendor/components/blocks/blockquotecaption.scss';
import '../vendor/components/blocks/caption.scss';
import '../vendor/components/blocks/todo.scss';
import '../vendor/components/blocks/image.scss';

import {
  KeyBindingUtil,
  Modifier,
  AtomicBlockUtils,
} from 'draft-js';

import {
  StringToTypeMap,
  Block,
  keyBindingFn,
  createEditorState,
  addNewBlockAt,
  beforeInput,
  getCurrentBlock,
  ImageSideButton,
  BreakSideButton,
  rendererFn,
  HANDLED,
  NOT_HANDLED
} from '../vendor/index';
import {
  setRenderOptions,
  blockToHTML,
  entityToHTML,
  styleToHTML,
} from '../vendor/exporter';

// Local style
import './Notepad.scss';

const Option = Select.Option;

const sampleMarkup =
  '<p>Write your story</p>';

const blocksFromHTML = convertFromHTML(sampleMarkup);
const contentState = ContentState.createFromBlockArray(
  blocksFromHTML.contentBlocks,
  blocksFromHTML.entityMap
);

// Main notebook comp (handles editor switching)
export default class Notepad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createEditorState(),
      editorEnabled: true,
      placeholder: 'Write here...',
      _isMounted: false,
    };

    this.sideButtons = [{
      title: 'Image',
      component: ImageSideButton,
    }, {
      title: 'Embed',
      component: EmbedSideButton,
    }, {
      title: 'Separator',
      component: SeparatorSideButton,
    },
    {
      title: 'Break',
      component: BreakSideButton,
    }
  ];

    // this.exporter = setRenderOptions({
      // styleToHTML,
      // blockToHTML: newBlockToHTML,
      // entityToHTML: newEntityToHTML,
    // });

    this.getEditorState = () => this.state.editorState;
    this.handleDroppedFiles = this.handleDroppedFiles.bind(this);
    this.onChange = this.onChange.bind(this);

    this.onEditorStateChange = this.onEditorStateChange.bind(this); 
    this.refsEditor = React.createRef();
  }
  
  onChange = (editorState, callback = null) => {
    if (this.state._isMounted)
    if (this.state.editorEnabled) {
      this.setState({ editorState }, () => {
        if (callback) {
          callback();
        }
      });
    }
  };

  getBlocksFromHTML(html) {

  }

  getHTMLFromBlocks(html) {

  }

  onEditorStateChange = (editorState) => {
    console.log("Editor state change: ", editorState);
    if (this.state._isMounted) 
    this.setState({
      editorState,
    });
  }

  componentDidMount() {
    this.setState({_isMounted: true});
  }

  componentWillUnmount() {
    this.setState({_isMounted: false});
  }

  componentWillReceiveProps(nextProps) {
    const editorType  = nextProps.editorType;
    if (this.state._isMounted)
    this.setState({ editorType: editorType });
  }

  handleDroppedFiles(selection, files) {
    window.ga('send', 'event', 'draftjs', 'filesdropped', files.length + ' files');
    const file = files[0];
    if (file.type.indexOf('image/') === 0) {
      // eslint-disable-next-line no-undef
      const src = URL.createObjectURL(file);
      this.onChange(addNewBlockAt(
        this.state.editorState,
        selection.getAnchorKey(),
        Block.IMAGE, {
          src,
        }
      ));
      // return HANDLED;
    }
    // return NOT_HANDLED
    return;
  }

  render() {
    const editorState = this.state.editorState;
    const editorEnabled = this.state.editorEnabled;
    const editorType = this.state.editorType;
    let editor = {};
    switch (editorType) {
      case 'inline':
      editor =     
        <div className="editor-action">
          <MEditor
            ref={(e) => {this._editor = e;}}
            editorState={editorState}
            onChange={this.onChange}
            editorEnabled={editorEnabled}
            handleDroppedFiles={this.handleDroppedFiles}
            placeholder={"Write your story"}
            sideButtons={this.sideButtons}
            onChange={this.onChange} />
            />
          </div>
          break;
        case 'full':
          editor = 
          <React.Fragment>
        <div className="editor">
          <Editor
            placeholder="Write your story"
            editorState={this.state.editorState} 
            onEditorStateChange={this.onEditorStateChange}
            ref={(element) => { this.editor = element; }}
            />
          </div>
       </React.Fragment>
          break;
        case 'code': 
          editor = null;
          break;
        case 'equation':
          editor = null;
          break;
        default:
          editor =     
          <div className="danteEditorWrapper">
            <div className="editor-action">
              <MEditor
                ref={(e) => {this._editor = e;}}
                editorState={editorState}
                onChange={this.onChange}
                editorEnabled={editorEnabled}
                handleDroppedFiles={this.handleDroppedFiles}
                placeholder={"Write your story"}
                sideButtons={this.sideButtons}
              />
            </div>
          </div>
    }
    return (
      <div className="notebookEditorWrapper">
        {editor}
        </div>
    );
  }
}


// Medium-draft sidebar menu comps

class SeparatorSideButton extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let editorState = this.props.getEditorState();
    const content = editorState.getCurrentContent();
    const contentWithEntity = content.createEntity('separator', 'IMMUTABLE', {});
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
    this.props.setEditorState(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        '-'
      )
    );
    this.props.close();
  }

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add a separator"
        onClick={this.onClick}
      >
        <i className="fa fa-minus" />
      </button>
    );
  }
}

class EmbedSideButton extends React.Component {

  static propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    close: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.addEmbedURL = this.addEmbedURL.bind(this);
  }

  onClick() {
    const url = window.prompt('Enter a URL', 'https://www.youtube.com/watch?v=PMNFaAUs2mo');
    this.props.close();
    if (!url) {
      return;
    }
    this.addEmbedURL(url);
  }

  addEmbedURL(url) {
    let editorState = this.props.getEditorState();
    const content = editorState.getCurrentContent();
    const contentWithEntity = content.createEntity('embed', 'IMMUTABLE', {url});
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
    this.props.setEditorState(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        'E'
      )
    );
  }

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add an Embed"
        onClick={this.onClick}
      >
        <i className="fa fa-code" />
      </button>
    );
  }
}

class AtomicEmbedComponent extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showIframe: false,
    };
    this.enablePreview = this.enablePreview.bind(this);
  }

  componentDidMount() {
    this.renderEmbedly();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showIframe !== this.state.showIframe && this.state.showIframe === true) {
      this.renderEmbedly();
    }
  }

  getScript() {
    const script = document.createElement('script');
    script.async = 1;
    script.src = '//cdn.embedly.com/widgets/platform.js';
    script.onload = () => {
      window.embedly();
    };
    document.body.appendChild(script);
  }

  renderEmbedly() {
    if (window.embedly) {
      window.embedly();
    } else {
      this.getScript();
    }
  }

  enablePreview() {
    this.setState({
      showIframe: true,
    });
  }

  render() {
    const { url } = this.props.data;
    const innerHTML = `<div><a class="embedly-card" href="${url}" data-card-controls="0" data-card-theme="dark">Embedded ― ${url}</a></div>`;
    return (
      <div className="md-block-atomic-embed">
        <div dangerouslySetInnerHTML={{ __html: innerHTML }} />
      </div>
    );
  }
}

const AtomicSeparatorComponent = (props) => (
  <hr />
);

const AtomicBlock = (props) => {
  const { blockProps, block } = props;
  const content = blockProps.getEditorState().getCurrentContent();
  const entity = content.getEntity(block.getEntityAt(0));
  const data = entity.getData();
  const type = entity.getType();
  if (blockProps.components[type]) {
    const AtComponent = blockProps.components[type];
    return (
      <div className={`md-block-atomic-wrapper md-block-atomic-wrapper-${type}`}>
        <AtComponent data={data} />
      </div>
    );
  }
  return <p>Block of type <b>{type}</b> is not supported.</p>;
};
