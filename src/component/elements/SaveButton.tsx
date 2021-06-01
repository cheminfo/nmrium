/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
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

interface SaveButtonProps {
  popupTitle: string;
  popupPlacement: string;
  disabled: boolean;
  className: string;
  onClick: () => void;
}

function SaveButton(props: SaveButtonProps) {
  const {
    className = '',
    disabled = false,
    popupPlacement = 'left',
    popupTitle = 'Save',
    onClick,
  } = props;

  return (
    <div className={className}>
      <ToolTip
        className={className}
        title={popupTitle}
        popupPlacement={popupPlacement}
      >
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
}

export default memo(SaveButton);
