import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

import NoteContents from 'components/NoteContents';
import NotePopup from 'components/NotePopup';
import Icon from 'components/Icon';

import core from 'core';
import getAnnotationType from 'helpers/getAnnotationType';
import getAnnotationIcon from 'helpers/getAnnotationIcon';
import annotationColorToCss from 'helpers/annotationColorToCss';
import getAnnotationColor from 'helpers/getAnnotationColor';
import selectors from 'selectors';

import './NoteRoot.scss';

class NoteRoot extends React.Component {
  static propTypes = {
    annotation: PropTypes.object.isRequired,
    searchInput: PropTypes.string,
    renderAuthorName: PropTypes.func.isRequired,
    renderContents: PropTypes.func.isRequired,
    isNoteExpanded: PropTypes.bool.isRequired,
    isRootContentEditing: PropTypes.bool.isRequired,
    sortNotesBy: PropTypes.string.isRequired,
    openEditing: PropTypes.func.isRequired,
    closeEditing: PropTypes.func.isRequired,
  }
  
  componentDidMount() {
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
  }

  componentWillUnmount() {
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
  }

  onAnnotationChanged = () => {
    if (this.props.isNoteExpanded) {
      this.forceUpdate();
    }
  }
  
  deleteNote = () => {
    const { annotation } = this.props;

    core.deleteAnnotations([ ...annotation.getReplies(), annotation ]);
  }

  renderHeader = () => {
    const { annotation, isNoteExpanded, sortNotesBy, openEditing, renderAuthorName } = this.props;
    const type = getAnnotationType(annotation);
    const icon = getAnnotationIcon(type);
    const color = annotationColorToCss(annotation[getAnnotationColor(type)]);
    const numberOfReplies = Object.keys(this.props.replies).length;

    return (
      <div className="title">
        <div className="type">
          {icon
          ? <Icon className="icon" glyph={icon} color={color} />
          : annotation.Subject
          }
        </div>
        {renderAuthorName(annotation)}
        {(sortNotesBy !== 'time' || isNoteExpanded || numberOfReplies > 0) &&
          <span className="spacer"></span>
        }
        <div className="time">
          {(sortNotesBy !== 'time' || isNoteExpanded) &&
            dayjs(annotation.DateCreated || new Date()).format('MMM D, h:mma')
          }
          {numberOfReplies > 0 &&
            ` (${numberOfReplies})`
          }
        </div>
        <NotePopup 
          {...this.props}
          openEditing={openEditing} 
          onDelete={this.deleteNote} 
        />
      </div>
    );
  }

  render() {
    return(
      <div className="NoteRoot">
        {this.renderHeader()}
        <NoteContents 
          {...this.props}
          isEditing={this.props.isRootContentEditing} 
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  sortNotesBy: selectors.getSortNotesBy(state)
});

export default connect(mapStateToProps)(NoteRoot);