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
    this.sigBg = React.createRef();
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
    this.signatureTool.on('saveDefault', this.onSaveDefault);
    // hack, override the original drawBackground to draw nothing on the canvas
    // so that there's no 'Sign Here' in the image when we use canvas.toDataURL()
    this.signatureTool.drawBackground = function() {
      const multiplier = window.utils.getCanvasMultiplier();
      this.ctx.scale(multiplier, multiplier);
    };
    this.signatureTool.setSignatureCanvas($(this.canvas.current));
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.isOpen && this.props.isOpen) {
      if (this.canvas.current) {
        this.updateCanvasSize();
        this.updateBackgroundSize();
      }
      this.props.closeElements([ 'printModal', 'loadingModal', 'errorModal' ]);
    }
    
    if (!prevState.isAddingSignature && this.state.isAddingSignature) {
      this.signatureTool.setSignatureCanvas($(this.canvas.current));
      this.signatureTool.clearSignatureCanvas();
      this.updateCanvasSize();
      this.updateBackgroundSize();
      this.signatureTool.openSignature();
    }
  }

  componentWillUnmount() {
    this.signatureTool.off('locationSelected', this.onLocationSelected);
    this.signatureTool.off('annotationAdded', this.onSignatureAdded);
    this.signatureTool.off('saveDefault', this.onSaveDefault);
  }

  updateCanvasSize = () => {
    const width = window.innerWidth > 620 ? 600 : window.innerWidth - 20;
    const height = window.innerHeight > 466 ? 300 : window.innerHeight - 80 - 96;
    this.canvas.current.style.width = `${width}px`;
    this.canvas.current.style.height = `${height}px`;
    this.canvas.current.width = width * window.utils.getCanvasMultiplier();
    this.canvas.current.height = height * window.utils.getCanvasMultiplier();
  }

  updateBackgroundSize = () => {
    const { width, height } = window.getComputedStyle(this.canvas.current);

    this.sigBg.current.style.width = width;
    this.sigBg.current.style.height = height;
  }
 
  onLocationSelected = () => {
    this.props.openElement('signatureModal');
    if (this.canvas.current) {
      this.signatureTool.openSignature();
    }
  }

  getSignatureImage = index => {
    return (
      <img 
        className="signature-image"
        src={this.canvas.current.toDataURL()} 
        onClick={() => this.addDefaultSignature(index)}
      >
      </img>
    );
  }

  onSaveDefault = (e, paths) => {
    const defaultSignatures = [ ...this.state.defaultSignatures ];
    const defaultSignature = {
      img: this.getSignatureImage(defaultSignatures.length),
      paths
    };

    defaultSignatures.push(defaultSignature);
    this.setState({ 
      defaultSignatures,
      isAddingSignature: !defaultSignatures.length
    });
    console.log(!defaultSignatures.length);
    setTimeout(() => {
      this.signatureTool.clearSignatureCanvas();
    }, 0);
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
    const { isStoringSignature, defaultSignatures } = this.state;
    this.signatureTool.addSignature(isStoringSignature);
    this.closeModal();

    if (!isStoringSignature) {
      this.setState({
        isAddingSignature: !defaultSignatures.length
      });
    }
  }

  addDefaultSignature = index => {
    const { paths } = this.state.defaultSignatures[index];

    this.signatureTool.initDefaultSignature(paths);
    this.signatureTool.addDefaultSignature();

    this.props.closeElement('signatureModal');
  }
  
  deleteDefaultSignature = index => {
    const defaultSignatures = [ ...this.state.defaultSignatures ];
    
    defaultSignatures.splice(index, 1);
    this.setState({
      defaultSignatures,
      isAddingSignature: !defaultSignatures.length 
    });
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
        <div ref={this.sigBg} className="sig-background"><p>Sign Here</p></div>
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
          {this.state.defaultSignatures.map(({ img }, index) => (
            <div key={index} className="wrapper">
              {img}
              <ActionButton dataElement="signatureModalDeleteButton" title="action.delete" img="ic_delete_black_24px" onClick={() => this.deleteDefaultSignature(index)} />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
  
  render() {
    console.log(this.state.isAddingSignature);
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