import { jsx, css } from '@emotion/core';
import { FaCopy } from 'react-icons/fa';

import CloseButton from '../elements/CloseButton';
/** @jsx jsx */

const styles = css`
  overflow: auto;
  width: 400px;
  .innerContainer {
    padding: 5px;
    width: 100%;
    height: 180px;
    border: none;
  }

  .mainButtonsContainer {
    padding: 5px 0px;
    border-bottom: 0.55px solid #ebebeb;
    display: flex;
    justify-content: space-between;
  }

  button:focus {
    outline: none;
  }

  button {
    background-color: transparent;
    border: none;
  }
`;

const CopyClipboardModal = ({ text, onClose, onCopyClick }) => {
  return (
    <div css={styles}>
      <div className="mainButtonsContainer handle">
        <button type="button" onClick={() => onCopyClick(text)}>
          <FaCopy />
        </button>

        <CloseButton onClick={onClose} />
      </div>
      <div
        className="innerContainer"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

export default CopyClipboardModal;
