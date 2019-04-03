import downloadPdf from 'helpers/downloadPdf';
import selectors from 'selectors';
import { workerTypes } from 'constants/types';

export default store => includeAnnotations => {
  const state = store.getState();
  if (selectors.isElementDisabled(state, 'downloadButton')) {
    console.warn('Download has been disabled.');
    return;
  }
  if (selectors.getDocumentType(state) !== workerTypes.PDF && selectors.getDocumentType(state) !== workerTypes.BLACKBOX) {
    console.warn('Document type is not PDF. Cannot be downloaded.');
    return;
  }
  downloadPdf(store.dispatch, {
    documentPath: selectors.getDocumentPath(state),
    filename: state.document.filename,
    includeAnnotations: includeAnnotations
  });
};