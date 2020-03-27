/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

import ToolTip from '../../elements/ToolTip/ToolTip';

const styles = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;
  button {
    background-color: transparent;
    border: none;
    height: 100%;
    margin: 0px 5px;
  }
  .save svg {
    fill: green;
    font-size: 16px;
  }
  .close svg {
    fill: #ca0000;
    font-size: 20px;
  }
`;
const PreferencesHeader = memo(({ onClose, onSave }) => {
  return (
    <div css={styles}>
      <ToolTip title="close Preferences" popupPlacement="left">
        <button className="close" type="button" onClick={onClose}>
          <FaTimes />
        </button>
      </ToolTip>
      <ToolTip title="save Preferences" popupPlacement="left">
        <button className="save" type="button" onClick={onSave}>
          <FaCheckCircle />
        </button>
      </ToolTip>
    </div>
  );
});

export default PreferencesHeader;
