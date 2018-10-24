import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Autolinker from 'autolinker';

import NoteRoot from 'components/NoteRoot';
import NoteReply from 'components/NoteReply';

import core from 'core';
import actions from 'actions';
import selectors from 'selectors';

import './Note.scss';

class Note extends React.PureComponent {
  static propTypes = {
    annotation: PropTypes.object.isRequired,
    isNoteEditing: PropTypes.bool.isRequired,
    isNoteExpanded: PropTypes.bool.isRequired,
    isRootContentEditing: PropTypes.bool.isRequired,
    isReplyFocused: PropTypes.bool.isRequired,
    setIsNoteEditing: PropTypes.func.isRequired,
    setNoteState: PropTypes.func.isRequired,
    replies: PropTypes.object.isRequired,
    measure: PropTypes.func.isRequired,
    searchInput: PropTypes.string,
    isReadOnly: PropTypes.bool,
    t: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.replyTextarea = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { annotation, setNoteState } = this.props;
    const commentEditable = core.canModify(annotation) && !annotation.getContents();
    
    const noteBeingEdited = !prevProps.isNoteEditing && this.props.isNoteEditing; 
    if (noteBeingEdited) {
      if (commentEditable) {
        this.openRootEditing();
      } else {
        this.replyTextarea.current.focus();
      }
    }
    
    const noteCollapsed = prevProps.isNoteExpanded && !this.props.isNoteExpanded; 
    if (noteCollapsed) {
      setNoteState(annotation.Id, {
        isRootContentEditing: false,
        isReplyFocused: false
      });
    }

    const noteHeightChanged = Object.keys(prevProps.replies).length !== Object.keys(this.props.replies).length                       
                          || prevProps.isRootContentEditing !== this.props.isRootContentEditing
                          || prevProps.isReplyFocused !== this.props.isReplyFocused;
    if (noteHeightChanged) {
      this.props.measure();
    }
  }

  onClickNote = e => {
    e.stopPropagation();

    const { isNoteExpanded, annotation } = this.props;

    if (isNoteExpanded) {
      core.deselectAnnotation(annotation);
    } else {
      core.deselectAllAnnotations();
      core.selectAnnotation(annotation);
      core.jumpToAnnotation(annotation);
    }
  }

  openRootEditing = () => {
    const { annotation, setNoteState } = this.props;

    setNoteState(annotation.Id, { isRootContentEditing: true });
  }

  closeRootEditing = () => {
    const { annotation, setNoteState, setIsNoteEditing } = this.props;

    setNoteState(annotation.Id, { isRootContentEditing: false });
    setIsNoteEditing(false);
  }

  onInput = () => {
    this.replyTextarea.current.style.height = '30px';
    this.replyTextarea.current.style.height = `${this.replyTextarea.current.scrollHeight + 2}px`;
    this.props.measure();
  }

  onKeyDown = e => {
    if ((e.metaKey || e.ctrlKey) && e.which === 13) { // (Cmd/Ctrl + Enter)
      this.postReply(e);
    }
  }

  onFocus = () => {
    const { annotation, setNoteState } = this.props;
    
    setNoteState(annotation.Id, { 
      isReplyFocused: true, 
      isRootContentEditing: false
    });
  }

  onBlur = () => {
    const { annotation, setNoteState, setIsNoteEditing } = this.props;

    setNoteState(annotation.Id, { isReplyFocused: false });
    setIsNoteEditing(false);
  }

  postReply = e => {
    e.preventDefault();

    const { value } = this.replyTextarea.current;
    if (value.trim().length > 0) {
      core.createAnnotationReply(this.props.annotation, value);
      this.clearReply();
    }
  }

  onClickCancel = () => {
    const { annotation, setNoteState } = this.props;
    
    this.clearReply();
    setNoteState(annotation.Id, { isReplyFocused: false }); 
    // This is for IE Edge
    this.replyTextarea.current.blur();
  }

  clearReply = () => {
    this.replyTextarea.current.value = '';
    this.replyTextarea.current.style.height = '30px';
  }

  renderAuthorName = annotation => {
    const name = core.getDisplayAuthor(annotation);

    if (!name) {
      return '(no name)';
    }

    return <span className="author" dangerouslySetInnerHTML={{__html: this.getText(name)}}></span>;
  }

  renderContents = contents => {
    if (!contents) {
      return null;
    }

    let text;
    const isContentsLinkable = Autolinker.link(contents).indexOf('<a') !== -1;
    if (isContentsLinkable) {
      const linkedContent = Autolinker.link(contents);
      // if searchInput is 't', replace <a ...>text</a> with
      // <a ...><span class="highlight">t</span>ext</a>
      text = linkedContent.replace(/>(.+)</i, (_, p1) => `>${this.getText(p1)}<`);
    } else {
      text = this.getText(contents);
    }

    return <span className="contents" dangerouslySetInnerHTML={{__html: text}}></span>; 
  }

  getText = text => {
    if (this.props.searchInput.trim()) {
      return this.getHighlightedText(text);
    }

    return text;
  }

  getHighlightedText = text => {
    const regex = new RegExp(`(${this.props.searchInput})`, 'gi');

    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  render() {
    const { t, isReadOnly, isNoteExpanded, replies, isReplyFocused } = this.props;
    const className = [
      'Note',
      isNoteExpanded ? 'expanded' : ''
    ].join(' ').trim();

    return (
      <div className={className} onClick={this.onClickNote}>
        <NoteRoot
          {...this.props}
          renderAuthorName={this.renderAuthorName}
          renderContents={this.renderContents}
          openEditing={this.openRootEditing}
          closeEditing={this.closeRootEditing}
        />

        <div className={`replies ${isNoteExpanded ? 'visible' : 'hidden'}`}>
          {Object.keys(replies).map(core.getAnnotationById).map(reply => 
            <NoteReply 
              {...this.props}
              key={reply.Id} 
              reply={reply} 
              renderAuthorName={this.renderAuthorName} 
              renderContents={this.renderContents} 
            />
          )}
          {!isReadOnly &&
            <div className="add-reply" onClick={e => e.stopPropagation()}>
              <textarea 
                ref={this.replyTextarea} 
                onInput={this.onInput} 
                onKeyDown={this.onKeyDown} 
                onBlur={this.onBlur} 
                onFocus={this.onFocus} 
                placeholder="Reply..." 
              />
              {isReplyFocused &&
                <div className="buttons" onMouseDown={e => e.preventDefault()}>
                  <button onMouseDown={this.postReply}>{t('action.reply')}</button>
                  <button onMouseDown={this.onClickCancel}>{t('action.cancel')}</button>
                </div>
              }
            </div>
          }
        </div>
    </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isNoteExpanded: selectors.isNoteExpanded(state, ownProps.annotation.Id),
  isNoteEditing: selectors.isNoteEditing(state, ownProps.annotation.Id),
  isReadOnly: selectors.isDocumentReadOnly(state)
});

const matDispatchToProps = {
  setIsNoteEditing: actions.setIsNoteEditing,
};

export default connect(mapStateToProps, matDispatchToProps)(translate(null, {wait: false})(Note));

