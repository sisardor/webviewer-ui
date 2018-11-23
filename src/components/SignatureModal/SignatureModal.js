import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from 'components/Button';
import ActionButton from 'components/ActionButton';

import core from 'core';
import getClassName from 'helpers/getClassName';
import actions from 'actions';
import selectors from 'selectors';

import './SignatureModal.scss';

class SignatureModal extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    openElement: PropTypes.func.isRequired,
    closeElement: PropTypes.func.isRequired,
    closeElements: PropTypes.func.isRequired
  }

  constructor() {
    super();
    this.canvas = React.createRef();
    this.signatureTool = core.getTool('AnnotationCreateSignature');
    this.state = { 
      defaultSignatures: [],
      isStoringSignature: true,
      isAddingSignature: true
    };
  }

  componentDidMount() {
    this.signatureTool.on('locationSelected', this.onLocationSelected);
    this.signatureTool.on('annotationAdded', this.onSignatureAdded);
    this.signatureTool.setSignatureCanvas($(this.canvas.current));
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.isOpen && this.props.isOpen) {
      if (this.canvas.current) {
        this.updateCanvasSize();
      }
      this.props.closeElements([ 'printModal', 'loadingModal', 'errorModal' ]);
    }
    
    if (!prevState.isAddingSignature && this.state.isAddingSignature) {
      this.signatureTool.setSignatureCanvas($(this.canvas.current));
      this.updateCanvasSize();
      this.signatureTool.openSignature();
    }
  }

  componentWillUnmount() {
    this.signatureTool.off('locationSelected', this.onLocationSelected);
    this.signatureTool.off('annotationAdded', this.onSignatureAdded);
  }

  updateCanvasSize = () => {
    const width = window.innerWidth > 620 ? 600 : window.innerWidth - 20;
    const height = window.innerHeight > 466 ? 300 : window.innerHeight - 80 - 96;
    this.canvas.current.style.width = `${width}px`;
    this.canvas.current.style.height = `${height}px`;
    this.canvas.current.width = width * window.utils.getCanvasMultiplier();
    this.canvas.current.height = height * window.utils.getCanvasMultiplier();
  }

  onLocationSelected = () => {
    this.props.openElement('signatureModal');
    if (this.canvas.current) {
      this.signatureTool.openSignature();
    }
  }
  
  onSignatureAdded = (e, signatureAnnotation) => {
    const defaultSignatures = [ ...this.state.defaultSignatures ];

    if (this.state.isStoringSignature && !signatureAnnotation.isCopy) {
      const defaultSignature = {
        Id: signatureAnnotation.Id,
        img: this.getSignatureImage(signatureAnnotation)
      };
      
      defaultSignatures.push(defaultSignature);
      this.setState({ defaultSignatures });
    }
    this.setState({ isAddingSignature: !defaultSignatures.length });

    setTimeout(() => {
      this.signatureTool.clearSignatureCanvas();
    }, 0);
  }

  getSignatureImage = signatureAnnotation => {
    return (
      <img 
        className="signature-image"
        src={this.canvas.current.toDataURL()} 
        onClick={() => this.addDefaultSignature(signatureAnnotation)}
      >
      </img>
    );
  }

  closeModal = () => {
    this.signatureTool.clearSignatureCanvas();
    this.props.closeElement('signatureModal');
  }
  
  clearCanvas = () => {
    this.signatureTool.clearSignatureCanvas();
    this.signatureTool.drawBackground();
  }
  
  addSignature = () => {
    this.signatureTool.addSignature();
    this.props.closeElement('signatureModal');
  }

  addDefaultSignature = signatureAnnotation => {
    const annotationCopy = window.docViewer.getAnnotationManager().getAnnotationCopy(signatureAnnotation);
    annotationCopy.isCopy = true; // hack, mark it as a copy annotation so that we don't store it
    this.signatureTool.freeHandAnnot = annotationCopy;
    this.signatureTool.Gv = this.signatureTool.freeHandAnnot.getPaths().length;
    this.signatureTool.addSignature();

    this.props.closeElement('signatureModal');
  }

  handleCheckboxChange = () => {
    this.setState(prevState => ({
      isStoringSignature: !prevState.isStoringSignature
    }));
  }

  switchModals = () => {
    this.setState(prevState => ({
      isAddingSignature: !prevState.isAddingSignature
    }));
  }

  deleteDefaultSignature = Id => {
    const defaultSignatures = this.state.defaultSignatures.filter(signature => signature.Id !== Id);

    this.setState({
      defaultSignatures,
      isAddingSignature: !defaultSignatures.length 
    });
  }

  renderSwitchModalButton = () => {
    const { isAddingSignature, defaultSignatures } = this.state;
    
    if (isAddingSignature && defaultSignatures.length === 0) {
      return null; 
    }

    const label = isAddingSignature ? 'Default Signatures' : 'Add Signature';
    
    return <Button label={label} onClick={this.switchModals} />;
  }

  renderAddSignatureModal = () => {
    return(
      <React.Fragment>
        <canvas ref={this.canvas}></canvas>
        <div className="footer">
          <ActionButton dataElement="signatureModalClearButton" title="action.clear" img="ic_delete_black_24px" onClick={this.clearCanvas} />
          <div className="footer__sign">
            <input type="checkbox" checked={this.state.isStoringSignature} onChange={this.handleCheckboxChange} />
            <p>Make Default Signature</p>
            <ActionButton dataElement="signatureModalSignButton" title="action.sign" img="ic_check_black_24px" onClick={this.addSignature} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderDefaultSignatureModal = () => {
    return (
      <React.Fragment>
        <div className="default-signatures-modal">
          {this.state.defaultSignatures.map(({ Id, img }) => (
            <div key={Id} className="wrapper">
              {img}
              <ActionButton dataElement="signatureModalDeleteButton" title="action.delete" img="ic_delete_black_24px" onClick={() => this.deleteDefaultSignature(Id)} />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
  
  render() {
    if (this.props.isDisabled) {
      return null;
    }

    const className = getClassName('Modal SignatureModal', this.props);

    return (
      <div className={className} onClick={this.closeModal}>
        <div className="container" onClick={e => e.stopPropagation()}>
          <div className="header">
            {this.renderSwitchModalButton()}
            <ActionButton dataElement="signatureModalCloseButton" title="action.close" img="ic_close_black_24px" onClick={this.closeModal} />
          </div>
          {this.state.isAddingSignature
            ? this.renderAddSignatureModal()
            : this.renderDefaultSignatureModal()
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'signatureModal'),
  isOpen: selectors.isElementOpen(state, 'signatureModal'),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureModal);