/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useCallback } from 'react';

import Button from '../elements/Button';
import CloseButton from '../elements/CloseButton';
import { loadFile, extractFileMetaFromPath } from '../utility/FileUtility';

const styles = css`
  display: flex;
  flex-direction: column;
  width: 450px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    span {
      color: #464646;
      font-size: 15px;
      flex: 1;
    }

    button {
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
  }
  .container {
    display: flex;
    margin: 30px 5px;
    align-items: center;
    height: 36px;

    input {
      padding: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      margin: 2px;
    }
    input {
      flex: 10;
    }
    button {
      flex: 2;
      height: 100%;
    }
  }
`;
const allowedExtensions = ['dx', 'jdx'];

interface LoadJCAMPModalProps {
  onLoadClick: (element: any) => void;
  startLoading: () => void;
  onClose: (element?: string) => void;
}

export default function LoadJCAMPModal({
  onLoadClick,
  onClose,
  startLoading,
}: LoadJCAMPModalProps) {
  const pathReft = useRef<any>();

  const loadJCAMPHandler = useCallback(() => {
    const path = pathReft.current.value;
    const { name, extension } = extractFileMetaFromPath(path);
    if (allowedExtensions.includes(extension)) {
      startLoading?.();
      void loadFile(path, { asBuffer: true }).then((data) => {
        const file = {
          binary: data,
          name,
          extension,
          jcampURL: path,
        };
        onLoadClick(file);
      });
    } else {
      onLoadClick(null);
    }
  }, [onLoadClick, startLoading]);
  return (
    <div css={styles}>
      <div className="header handle">
        <span>Load JCAMP Dialog</span>

        <CloseButton onClick={onClose} />
      </div>
      <div className="container">
        <input
          ref={pathReft}
          type="text"
          placeholder="Enter URL to JCAMP-DX file"
        />
        <Button.Done onClick={loadJCAMPHandler}>Load</Button.Done>
      </div>
    </div>
  );
}
