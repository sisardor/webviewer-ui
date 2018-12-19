import React from 'react';
import ReactDOM from 'react-dom';

import APITestContainer from './components/APITestContainer';

import apis, { whitelist } from './apis';

const viewerElement = document.getElementById('viewer');
const viewer = new PDFTron.WebViewer({
  path: '/lib',
  l: window.sampleL,
  initialDoc: '/samples/files/webviewer-demo-annotated.pdf',
}, viewerElement);

viewerElement.addEventListener('ready', function() {
  const viewerInstance = viewer.getInstance();

  warnIfMissingAPIs(viewerInstance);
  ReactDOM.render(
    <APITestContainer />, 
    document.getElementById('api-tests')
  );
});

const warnIfMissingAPIs = viewerInstance => {
  const missingApis = [];

  Object.keys(viewerInstance).forEach(key => {
    if (typeof viewerInstance[key] === 'function' && !apis[key] && whitelist.indexOf(key) < 0) {
      missingApis.push(key);
    }
  });
  if (missingApis.length > 0) {
    console.warn(`APIs missing from this test:\n${missingApis.sort().join('\n')}`);
  }
};
