import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { colors, padding } from '../../styles';
import { deviceUtils } from '../../utils';
import { Centered, Column } from '../layout';
import TouchableBackdrop from '../TouchableBackdrop';

const Container = styled(Centered)`
  ${padding(15)};
  height: 100%;
`;

const ModalElement = styled(Column)`
  background-color: ${colors.white};
  border-radius: 12;
  flex-shrink: 0;
  height: ${({ height }) => height};
  width: 100%;
`;

const Modal = ({
  fixedToTop,
  height,
  onCloseModal,
  statusBarStyle,
  ...props
}) => (
  <Container direction="column" style={{ justifyContent: fixedToTop ? 'flex-start' : 'center', top: fixedToTop ? 91 : 0 }}>
    <TouchableBackdrop onPress={onCloseModal} />
    <ModalElement
      {...props}
      height={height}
    />
  </Container>
);

Modal.propTypes = {
  fixedToTop: PropTypes.bool,
  height: PropTypes.number.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  statusBarStyle: PropTypes.oneOf(['default', 'light-content', 'dark-content']),
};

Modal.defaultProps = {
  fixedToTop: false,
  height: deviceUtils.dimensions.height - 230,
  statusBarStyle: 'light-content',
};

export default Modal;
