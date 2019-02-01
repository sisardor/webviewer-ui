import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ActionButton from 'components/ActionButton';

import core from 'core';
import getClassName from 'helpers/getClassName';
import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import actions from 'actions';
import selectors from 'selectors';

import './SignatureOverlay.scss';

class SignatureOverlay extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    isDisabled: PropTypes.bool,
    closeElements: PropTypes.func.isRequired,
    closeElement: PropTypes.func.isRequired,
    openElement: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.signatureTool = core.getTool('AnnotationCreateSignature');
    this.overlay = React.createRef();
    this.MAX_DEFAULT_SIGNATURES = 2;
    this.state = {
      defaultSignatures: [],
      left: 0,
      right: 'auto'
    };
  }

  componentDidMount() {
    this.signatureTool.on('saveDefault', this.onSaveDefault);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['viewControlsOverlay', 'searchOverlay', 'menuOverlay', 'toolsOverlay', 'zoomOverlay', 'toolStylePopup']);
      this.setState(getOverlayPositionBasedOn('signatureToolButton', this.overlay));
    }
  }

  componentWillUnmount() {
    this.signatureTool.off('saveDefault', this.onSaveDefault);
  }

  onSaveDefault = (e, paths) => {
    const defaultSignatures = [ ...this.state.defaultSignatures ];
    if (defaultSignatures.length === this.MAX_DEFAULT_SIGNATURES) {
      defaultSignatures.unshift();
    } 

    const signatureCanvas = document.querySelector('.signature-canvas');
    const savedSignature = {
      imgSrc: signatureCanvas.toDataURL(),
      paths
    };
    defaultSignatures.push(savedSignature);

    this.setState({ defaultSignatures });
  }

  initDefaultSignature = paths => {
    this.signatureTool.initDefaultSignature(paths);
    this.props.closeElement('signatureOverlay');
  }

  deleteDefaultSignature = index => {
    const defaultSignatures = [ ...this.state.defaultSignatures ];
    
    defaultSignatures.splice(index, 1);
    if (defaultSignatures.length === 0) {
      this.signatureTool.trigger('noDefaultSignatures');
    }
    this.setState({ defaultSignatures });
  }

  openSignatureModal = () => {
    const { defaultSignatures } = this.state;
    const { openElement, closeElement } = this.props;
    
    if (defaultSignatures.length < this.MAX_DEFAULT_SIGNATURES) {
      openElement('signatureModal');
      closeElement('signatureOverlay');
    }
  }

  /**
   * TODO:
   * 1. i18n 'Add a Signature'
   */

  render() {
    const { left, right, defaultSignatures } = this.state;
    const className = getClassName('Overlay SignatureOverlay', this.props);

    if (this.props.isDisabled) {
      return null;
    }

    return(
      <div className={className} ref={this.overlay} style={{ left, right }} onClick={e => e.stopPropagation()}>
        <div className="default-signatures-container">
          {defaultSignatures.map(({ imgSrc, paths }, index) => ( // TODO: may have a bug when deleting images
            <div className="default-signature" key={index}>
              <div className="signature-image" onClick={() => this.initDefaultSignature(paths)}>
                <img src={imgSrc} />
              </div>
              <ActionButton dataElement="defaultSignatureDeleteButton" img="ic_delete_black_24px" onClick={() => this.deleteDefaultSignature(index)} />
            </div>
          ))}
          <div 
            className={`add-signature${defaultSignatures.length === this.MAX_DEFAULT_SIGNATURES ? ' disabled' : ''}`} 
            onClick={this.openSignatureModal}
          >
            Add a Signature
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'signatureOverlay'),
  isOpen: selectors.isElementOpen(state, 'signatureOverlay')
});

const mapDispatchToProps = {
  closeElements: actions.closeElements,
  closeElement: actions.closeElement,
  openElement: actions.openElement
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureOverlay);