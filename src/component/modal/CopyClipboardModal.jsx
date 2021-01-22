import { css } from '@emotion/react';
import { FaCopy } from 'react-icons/fa';

import CloseButton from '../elements/CloseButton';
/** @jsxImportSource @emotion/react */

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

  button {
    background-color: transparent;
    border: none;
    padding: 0 5px;
  }

  button:disabled {
    opacity: 0.6;
  }
`;

function CopyClipboardModal({ text, onClose, onCopyClick }) {
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
}

export default CopyClipboardModal;
