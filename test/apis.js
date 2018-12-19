export default {
  loadDocument() {
    viewerInstance.loadDocument('/samples/files/webviewer-demo-annotated.pdf');
  },
  closeDocument() {
    viewerInstance.closeDocument();
  },
  divider1: true,
  addSearchListener() {
    viewerInstance.addSearchListener(constants.searchListener);
  },
  removeSearchListener() {
    viewerInstance.removeSearchListener(constants.searchListener);
  },
  searchText() {
    viewerInstance.searchText('web');
  },
  searchTextFull() {
    viewerInstance.searchTextFull('web');
  },
  divider2: true,
  addSortStrategy() {
    viewerInstance.addSortStrategy(constants.sortStrategy);
  },
  setSortStrategy() {
    viewerInstance.setSortStrategy('time');
  },
  divider3: true,
  openElement() {
    viewerInstance.openElement('viewControlsOverlay');
  },
  isElementOpen() {
    viewerInstance.isElementOpen('viewControlsOverlay');
  },
  closeElement() {
    viewerInstance.closeElement('viewControlsOverlay');
  },
  toggleElement() {
    viewerInstance.toggleElement('viewControlsOverlay');
  },
  openElements() {
    viewerInstance.openElements(['outlinesPanel']);
  },
  closeElements() {
    viewerInstance.closeElements(['outlinesPanel']);
  },
  divider4: true,
  disableTool() {
    viewerInstance.disableTool('AnnotationCreateSticky');
  },
  isToolDisabled() {
    viewerInstance.isToolDisabled('AnnotationCreateSticky');
  },
  enableTool() {
    viewerInstance.enableTool('AnnotationCreateSticky');
  },
  disableTools() {
    viewerInstance.disableTools();
  },
  enableTools() {
    viewerInstance.enableTools();
  },
  divider5: true,
  disableElement() {
    viewerInstance.disableElement('leftPanelButton');
  },
  isElementDisabled() {
    viewerInstance.isElementDisabled('leftPanelButton');
  },
  enableElement() {
    viewerInstance.enableElement('leftPanelButton');
  },
  disableElements() {
    viewerInstance.disableElements(['fitButton', 'zoomOutButton', 'zoomInButton']);
  },
  enableElements() {
    viewerInstance.enableElements(['fitButton', 'zoomOutButton', 'zoomInButton']);
  },
  enableAllElements() {
    viewerInstance.enableAllElements();
  },
  divider6: true,
  disableAnnotations() {
    viewerInstance.disableAnnotations();
  },
  enableAnnotations() {
    viewerInstance.enableAnnotations();
  },
  disableDownload() {
    viewerInstance.disableDownload();
  },
  enableDownload() {
    viewerInstance.enableDownload();
  },
  enableFilePicker() {
    viewerInstance.enableFilePicker();
  },
  disableFilePicker() {
    viewerInstance.disableFilePicker();
  },
  disableNotesPanel() {
    viewerInstance.disableNotesPanel();
  },
  enableNotesPanel() {
    viewerInstance.enableNotesPanel();
  },
  disablePrint() {
    viewerInstance.disablePrint();
  },
  enablePrint() {
    viewerInstance.enablePrint();
  },
  useEmbeddedPrint() {
    viewerInstance.useEmbeddedPrint(false);
  },
  disableTextSelection() {
    viewerInstance.disableTextSelection();
  },
  enableTextSelection() {
    viewerInstance.enableTextSelection();
  },
  divider7: true,
  setAnnotationUser() {
    viewerInstance.setAnnotationUser('PDFTron');
  },
  getAnnotationUser() {
    console.log('Current annotation user: ', viewerInstance.getAnnotationUser());
  },
  setAdminUser() {
    viewerInstance.setAdminUser(true);
  },
  isAdminUser() {
    console.log('Is user admin: ', viewerInstance.isAdminUser());
  },
  setReadOnly() {
    viewerInstance.setReadOnly(true);
  },
  isReadOnly() {
    console.log('Is read only: ', viewerInstance.isReadOnly());
  },
  divider8: true,
  getCurrentPageNumber() {
    console.log('Current page number: ', viewerInstance.getCurrentPageNumber());
  },
  setCurrentPageNumber() {
    viewerInstance.setCurrentPageNumber(2);
  },
  getPageCount() {
    console.log('Total pages: ', viewerInstance.getPageCount());
  },
  goToNextPage() {
    viewerInstance.goToNextPage();
  },
  goToPrevPage() {
    viewerInstance.goToPrevPage();
  },
  goToLastPage() {
    viewerInstance.goToLastPage();
  },
  goToFirstPage() {
    viewerInstance.goToFirstPage();
  },
  divider9: true,
  getFitMode() {
    console.log('Current fit mode: ', viewerInstance.getFitMode());
  },
  setFitMode() {
    viewerInstance.setFitMode(viewerInstance.FitMode.FitWidth);
  },
  getLayoutMode() {
    console.log('Current layout mode: ', viewerInstance.getLayoutMode());
  },
  setLayoutMode() {
    viewerInstance.setLayoutMode(viewerInstance.LayoutMode.Single);
  },
  getZoomLevel() {
    console.log('Current zoom level: ', viewerInstance.getZoomLevel());
  },
  setZoomLevel() {
    viewerInstance.setZoomLevel('160%');
  },
  rotateClockwise() {
    viewerInstance.rotateClockwise();
  },
  rotateCounterClockwise() {
    viewerInstance.rotateCounterClockwise();
  },
  divider10: true,
  getToolMode() {
    console.log('Current tool mode: ', viewerInstance.getToolMode());
  },
  setToolMode() {
    viewerInstance.setToolMode('AnnotationCreateRectangle');
  },
  registerTool() {
    var contentWindow = document.querySelector('iframe').contentWindow;
    var MyTool = function () {
      contentWindow.Tools.StickyCreateTool.call(this, viewerInstance.docViewer, contentWindow.Annotations.StickyAnnotation);
    };
    MyTool.prototype = new contentWindow.Tools.StickyCreateTool();
    viewerInstance.registerTool({
      toolName: 'MyTool',
      toolObject: new MyTool(),
      buttonImage: 'ic_annotation_sticky_note_black_24px',
      buttonName: 'myToolButton',
      buttonGroup: 'miscTools',
      tooltip: 'MyTool'
    });
    viewerInstance.setToolMode('MyTool');
  },
  unregisterTool() {
    viewerInstance.unregisterTool('MyTool');
  },
  updateTool() {
    viewerInstance.updateTool('AnnotationCreateRectangle', {
      buttonGroup: 'miscTools'
    });
  },
  divider12: true,
  setActiveHeaderGroup() {
    viewerInstance.setActiveHeaderGroup('tools');
  },
  setActiveLeftPanel() {
    viewerInstance.setActiveLeftPanel('thumbnailsPanel');
  },
  setCustomPanel() {
    viewerInstance.setCustomPanel({
      tab: {
        dataElement: 'customPanelTab',
        title: 'customPanelTab',
        img: 'https://pbs.twimg.com/profile_images/927446347879292930/Fi0D7FGJ_400x400.jpg',
      },
      panel: {
        dataElement: 'customPanel',
        render() {
          const div = document.createElement('div');
          div.innerHTML = 'Hello World';
          return div;
        }
      }
    });
  },
  setHeaderItems() {
    viewerInstance.setHeaderItems(function (header) {
      header.push({
        type: 'actionButton',
        label: 'HO',
        onClick() {
          console.log('HO');
        }
      });
    });
  },
  setLanguage() {
    viewerInstance.setLanguage('fr');
  },
  setNoteDateFormat() {
    viewerInstance.setNoteDateFormat('DD.MM.YYYY HH:MM');
  },
  setPageLabels() {
    viewerInstance.setPageLabels(['i', 'ii', 'iii']);
  },
  setTheme() {
    viewerInstance.setTheme('dark');
  },
  divider13: true,
  downloadPdf() {
    viewerInstance.downloadPdf();
  },
  focusNote() {
    var annotationId = viewerInstance.docViewer.getAnnotationManager().getAnnotationsList()[0].Id;
    viewerInstance.focusNote(annotationId);
  },
  isMobileDevice() {
    console.log('isMobileDevice: ' + !!viewerInstance.isMobileDevice());
  },
  toggleFullScreen() {
    viewerInstance.toggleFullScreen();
  }
};

export const whitelist = [
  'getBBAnnotManager',
  'setNotesPanelSort',
  'setSortNotesBy',
  'setEngineType',
  'setPrintQuality',
  'updateOutlines',
  'getShowSideWindow',
  'setShowSideWindow',
  'getSideWindowVisibility',
  'setSideWindowVisibility',
  'saveAnnotations'
];