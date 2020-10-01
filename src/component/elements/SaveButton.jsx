/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { FaCheck } from 'react-icons/fa';

import ToolTip from './ToolTip/ToolTip';

const styles = css`
  background-color: transparent;
  border: none;
  height: 100%;
  svg {
    fill: green;
    font-size: 16px;
  }
`;
const SaveButton = memo(
  ({ onClick, popupTitle, popupPlacement, disabled, className }) => {
    return (
      <div className={className}>
        <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
          <button
            css={styles}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={className}
          >
            <FaCheck />
          </button>
        </ToolTip>
      </div>
    );
  },
);
SaveButton.defaultProps = {
  onClick: () => null,
  popupTitle: 'Save',
  popupPlacement: 'left',
  disabled: false,
  className: '',
};
SaveButton.propTypes = {
  onClick: PropTypes.func,
  popupTitle: PropTypes.string,
  popupPlacement: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SaveButton;
