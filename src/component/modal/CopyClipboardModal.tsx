/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaCopy } from 'react-icons/fa';

import { CloseButton } from '../elements/CloseButton';

const styles = css`
  overflow: auto;
  width: 400px;

  .inner-container {
    padding: 5px;
    width: 100%;
    height: 180px;
    border: none;
  }

  .main-buttons-container {
    padding: 5px 0;
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

interface CopyClipboardModalProps {
  text: string;
  onClose: () => void;
  onCopyClick: (text: string) => void;
}

function CopyClipboardModal({
  text,
  onClose,
  onCopyClick,
}: CopyClipboardModalProps) {
  return (
    <div css={styles}>
      <div className="main-buttons-container handle">
        <button type="button" onClick={() => onCopyClick(text)}>
          <FaCopy />
        </button>

        <CloseButton tooltip="Close" onClick={onClose} />
      </div>
      <div
        className="inner-container"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

export default CopyClipboardModal;
