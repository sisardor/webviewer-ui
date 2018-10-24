import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import NoteContents from 'components/NoteContents';
import NotePopup from 'components/NotePopup';

import core from 'core';

import './NoteReply.scss';

class NoteReply extends React.PureComponent {
  static propTypes = {
    annotation: PropTypes.object.isRequired,
    reply: PropTypes.object.isRequired,
    replies: PropTypes.object.isRequired,
    searchInput: PropTypes.string,
    canModify: PropTypes.bool.isRequired,
    renderAuthorName: PropTypes.func.isRequired,
    renderContents: PropTypes.func.isRequired,
    setNoteState: PropTypes.func.isRequired,
    measure: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.noteContents = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const Id = this.props.reply.Id;
    if (prevProps.replies[Id].isReplyContentEditing !== this.props.replies[Id].isReplyContentEditing) {
      this.props.measure();
    }
  }

  deleteReply = () => {
    core.deleteAnnotations([ ...this.props.reply.getReplies(), this.props.reply ]);
  }

  openEditing = () => {
    this.setIsReplyContentEditing(true);
  }

  closeEditing = () => {
    this.setIsReplyContentEditing(false);
  }

  setIsReplyContentEditing = isReplyContentEditing => {
    const { setNoteState, annotation, replies, reply } = this.props;

    setNoteState(annotation.Id, {
      replies: {
        ...replies,
        [reply.Id]: {
          isReplyContentEditing,
          canModify: core.canModify(reply)  
        }
      }
    });
  }

  renderHeader = () => {
    const { reply, renderAuthorName, replies } = this.props;

    return (
      <div className="title">
        {renderAuthorName(reply)}
        <span className="spacer"></span>
        <span className="time">
          {' ' + dayjs(reply.DateCreated).format('MMM D, h:mma')}
        </span>
        <NotePopup 
          annotation={reply} 
          canModify={replies[reply.Id].canModify}
          isNoteExpanded 
          openEditing={this.openEditing} 
          onDelete={this.deleteReply} 
        />
      </div>
    );
  }

  render() {
    const { 
      reply, 
      renderContents, 
      searchInput,
      measure, 
      replies,
      setNoteState,
    } = this.props;

    return (
      <div className="NoteReply" onClick={e => e.stopPropagation()}>
        {this.renderHeader()}
        <NoteContents 
          annotation={reply}
          searchInput={searchInput}
          setNoteState={setNoteState}
          renderContents={renderContents}
          isEditing={replies[reply.Id].isReplyContentEditing} 
          closeEditing={this.closeEditing} 
          measure={measure}
        />
      </div>
    );
  }
}

export default NoteReply;