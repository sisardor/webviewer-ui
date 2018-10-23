import React from 'react';
import PropTypes from 'prop-types';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import Note from 'components/Note';
import ListSeparator from 'components/ListSeparator';

import core from 'core';
import sortMap from 'constants/sortMap';
import selectors from 'selectors';

import './NotesPanel.scss';

class NotesPanel extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isLeftPanelOpen: PropTypes.bool,
    display: PropTypes.string.isRequired,
    sortNotesBy: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
  }
  
  constructor() {
    super();
    this.state = {
      notesToRender: [], 
      searchInput: ''
    };
    this.cache = new CellMeasurerCache({
      defaultHeight: 60,
      fixedWidth: true
    });
    this.listRef = React.createRef();
    this.rootAnnotations = [];
    this.updatePanelOnInput = _.debounce(this.updatePanelOnInput.bind(this), 500);
  }

  componentDidMount() {
    core.addEventListener('documentUnloaded', this.onDocumentUnloaded);
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
    core.addEventListener('annotationHidden', this.onAnnotationChanged);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.notesToRender.length !== this.state.notesToRender.length ||
      prevProps.sortNotesBy !== this.props.sortNotesBy
    ) {
      this.cache.clearAll();
      if (this.listRef.current) {
        this.listRef.current.recomputeRowHeights();
      }
    }
  }

  componentWillUnmount() {
    core.removeEventListener('documentUnloaded', this.onDocumentUnloaded);
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
    core.removeEventListener('annotationHidden', this.onAnnotationChanged);
  }

  onDocumentUnloaded = () => {
    this.setState({ notesToRender: [] });
  }

  onAnnotationChanged = () => {
    this.rootAnnotations = this.getRootAnnotations();  
    const notesToRender = this.filterAnnotations(this.rootAnnotations, this.state.searchInput);
    
    this.setState({ notesToRender });
  }

  getRootAnnotations = () => core.getAnnotationsList().filter(annotation => annotation.Listable && !annotation.isReply() && !annotation.Hidden);

  handleInputChange = e => {
    const searchInput = e.target.value;

    this.updatePanelOnInput(searchInput);
  }

  updatePanelOnInput = searchInput => {
    let notesToRender;

    core.deselectAllAnnotations();
    if (searchInput.trim()) {
      notesToRender = this.filterAnnotations(this.rootAnnotations, searchInput);
      core.selectAnnotations(notesToRender); 
    } else {
      notesToRender = this.rootAnnotations;
    }

    this.setState({ notesToRender, searchInput });
  }

  filterAnnotations = (annotations, searchInput) => {
    return annotations.filter(rootAnnotation => {
      const replies = rootAnnotation.getReplies();
      // reply is also a kind of annotation
      // https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#createAnnotationReply__anchor
      const annotations = [ rootAnnotation, ...replies ];

      return annotations.some(annotation => {
        const content = annotation.getContents();
        const authorName = core.getDisplayAuthor(annotation);

        return this.isInputIn(content, searchInput) || this.isInputIn(authorName, searchInput);
      });
    });
  }

  isInputIn = (string, searchInput) => {
    if (!string) {
      return false;
    }

    return string.search(new RegExp(searchInput, 'i')) !== -1;
  }

  renderNotesPanelContent = () => {
    const {notesToRender} = this.state;
    const notes = sortMap[this.props.sortNotesBy].getSortedNotes(this.rootAnnotations);

    return(
      <React.Fragment>
        <div className={`notes-wrapper ${notesToRender.length ? 'visible' : 'hidden'}`}>
          <List
            ref={this.listRef}
            width={300}
            height={500}
            rowCount={notes.length}
            deferredMeasurementCache={this.cache}
            rowHeight={this.cache.rowHeight}
            rowRenderer={({ key, index, style, parent }) => (
              <CellMeasurer
                cache={this.cache}
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
              >
                {({ measure }) => (
                  <div className="note-wrapper" style={{ ...style}}>
                    {this.renderListSeparator(notes, index)}
                    <Note
                      annotation={notes[index]}
                      searchInput={this.state.searchInput}
                      measure={measure}
                    />
                  </div>
                )}
              </CellMeasurer>
            )}
          />
        </div>
        <div className={`no-results ${notesToRender.length ? 'hidden' : 'visible'}`}>
          {this.props.t('message.noResults')}
        </div>
      </React.Fragment>
    );
  }

  renderListSeparator = (notes, index) => {
    const { shouldRenderSeparator, getSeparatorContent } = sortMap[this.props.sortNotesBy];
    const currNote = notes[index];
    const prevNote = index === 0 ? currNote: notes[index-1];
    const isFirstNote = prevNote === currNote;

    if (
      shouldRenderSeparator && 
      getSeparatorContent &&
      (isFirstNote || shouldRenderSeparator(prevNote, currNote))
    ) {
      return <ListSeparator renderContent={() => getSeparatorContent(prevNote, currNote)} />;
    }

    return null;
  }

  render() {
    const { isDisabled, isLeftPanelOpen, display, t } = this.props;

    if (isDisabled || !isLeftPanelOpen) {
      return null;
    }

    return (
      <div className="Panel NotesPanel" style={{ display }} data-element="notesPanel" onClick={() => core.deselectAllAnnotations()}>
        {this.rootAnnotations.length === 0 
        ? <div className="no-annotations">{t('message.noAnnotations')}</div>
        : <React.Fragment>
            <div className="header">
              <input 
                type="text" 
                placeholder={t('message.searchPlaceholder')}
                onChange={this.handleInputChange} 
              />
              <Dropdown items={Object.keys(sortMap)} />
            </div>
            {this.renderNotesPanelContent()}
          </React.Fragment>
        }
      </div>
    );
  }
}

const mapStatesToProps = state => ({
  sortNotesBy: selectors.getSortNotesBy(state),
  isLeftPanelOpen: selectors.isElementOpen(state, 'leftPanel'),
  isDisabled: selectors.isElementDisabled(state, 'notesPanel'),
});

export default connect(mapStatesToProps)(translate()(NotesPanel));
