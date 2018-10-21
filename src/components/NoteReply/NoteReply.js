import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import NoteContents from 'components/NoteContents';
import NotePopup from 'components/NotePopup';

import core from 'core';

import './NoteReply.scss';

class NoteReply extends React.PureComponent {
  static propTypes = {
    reply: PropTypes.object.isRequired,
    searchInput: PropTypes.string,
    renderAuthorName: PropTypes.func.isRequired,
    renderContents: PropTypes.func.isRequired,
    measure: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.noteContents = React.createRef();
    this.state = {
      isEditing: false
    };
  }

  componentDidUpdate(_, prevState) {
    if (prevState.isEditing !== this.state.isEditing) {
      this.props.measure();
    }
  }

  deleteReply = () => {
    core.deleteAnnotations([ ...this.props.reply.getReplies(), this.props.reply ]);
  }

  openEditing = () => {
    this.setState({ isEditing: true });
  }

  closeEditing = () => {
    this.setState({ isEditing: false });
  }

  renderHeader = () => {
    const { reply, renderAuthorName } = this.props;

    return (
      <div className="title">
        {renderAuthorName(reply)}
        <span className="spacer"></span>
        <span className="time">
          {' ' + dayjs(reply.DateCreated).format('MMM D, h:mma')}
        </span>
        <NotePopup 
          annotation={reply} 
          isNoteExpanded 
          openEditing={this.openEditing} 
          onDelete={this.deleteReply} 
        />
      </div>
    );
  }

  render() {
    const { reply, renderContents, searchInput, measure } = this.props;
    const { isEditing } = this.state;

    return (
      <div className="NoteReply" onClick={e => e.stopPropagation()}>
        {this.renderHeader()}
        <NoteContents 
          annotation={reply}
          searchInput={searchInput}
          renderContents={renderContents}
          isEditing={isEditing} 
          closeEditing={this.closeEditing} 
          measure={measure}
        />
      </div>
    );
  }
}

export default NoteReply;