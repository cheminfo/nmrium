/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';

import CloseButton from '../elements/CloseButton';

import { ModalStyles } from './ModalStyle';

const styles = css`
  width: 600px;
  height: 300px;

  .inner-content {
    flex: 1;
    border: none;
    padding: 0 0 0 15px;
    overflow: hidden;
  }

  .text-area {
    width: 100%;
    height: 100%;
    outline: none;
    resize: none;
  }
`;

interface ImportPublicationStringModalProps {
  onClose: () => void;
}

function ImportPublicationStringModal({
  onClose,
}: ImportPublicationStringModalProps) {
  const textRef = useRef<any>();

  const publicationStringHandler = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pString = textRef.current.value;
  }, []);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Import from publication string</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <textarea
          ref={textRef}
          className="text-area"
          placeholder="Enter publication string"
        />
      </div>
      <div className="footer-container">
        <button
          type="button"
          onClick={publicationStringHandler}
          className="btn primary"
        >
          Import
        </button>
      </div>
    </div>
  );
}

export default ImportPublicationStringModal;
