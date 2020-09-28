/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { FaTimes } from 'react-icons/fa';

import ToolTip from './ToolTip/ToolTip';

const styles = css`
  background-color: transparent;
  border: none;
  height: 100%;
  display:flex,
  justify-content:center;
  align-items:center;

  svg {
    fill: #ca0000;
    font-size: 20px;
  }
`;
const CloseButton = memo(
  ({ onClick, popupTitle = 'Close', popupPlacement = 'left' }) => {
    return (
      <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
        <button css={styles} type="button" onClick={onClick}>
          <FaTimes />
        </button>
      </ToolTip>
    );
  },
);

CloseButton.defaultProps = {
  onClick: () => null,
  popupTitle: 'Close',
  popupPlacement: 'left',
  disabled: false,
};
CloseButton.propTypes = {
  onClick: PropTypes.func,
  popupTitle: PropTypes.string,
  popupPlacement: PropTypes.string,
  disabled: PropTypes.bool,
};

export default CloseButton;
