import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import OverlayItem from '../OverlayItem';

import core from 'core';
import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import { zoomTo } from 'helpers/zoom';
import actions from 'actions';
import selectors from 'selectors';

import './ZoomOverlay.scss';

class ZoomOverlay extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    closeElements: PropTypes.func.isRequired
  }

  constructor() {
    super();
    this.dropdown = React.createRef();
    this.state = {
      left: 0,
      right: 'auto'
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements([ 'viewControlsOverlay', 'toolsOverlay', 'searchOverlay', 'menuOverlay', 'toolStylePopup' ]);
      const { left, right } = getOverlayPositionBasedOn('zoomOverlayButton', this.dropdown);
      this.setState({
        left: left - 20,
        right
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    const { left, right } = getOverlayPositionBasedOn('zoomOverlayButton', this.dropdown);
    this.setState({
      left: left - 20,
      right
    })
  }

  render() { 
    const { isOpen } = this.props;
    const className = [
      'ZoomOverlay',
      isOpen ? 'open' : 'closed'
    ].join(' ').trim();
    const { left, right } = this.state;
    const zoomList = [0.1, 0.25, 0.5, 1.25, 1.5, 2, 4, 8, 16, 64];
    return (
      <div className = {className} data-element="zoomOverlay" style={{ left, right }} ref={this.dropdown}>
        <OverlayItem onClick={core.fitToWidth} buttonName="Fit to Width" />
        <OverlayItem onClick={core.fitToPage} buttonName="Fit to Page" />
        <div className="spacer" />
        {zoomList.map((zoomValue, i) => {
          return <OverlayItem key={i} 
          onClick={
            () => { 
              zoomTo(zoomValue);
            } 
          } 
          buttonName={zoomValue * 100 + '%'}
          /> 
          }
        )
      }
    </div>
    );
  }
}

const mapStateToProps = state => ({
  isOpen: selectors.isElementOpen(state, 'zoomOverlay')
});

const mapDispatchToProps = {
  closeElements: actions.closeElements
};

export default connect(mapStateToProps, mapDispatchToProps)(ZoomOverlay);
