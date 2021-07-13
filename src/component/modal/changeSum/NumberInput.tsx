/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useCallback } from 'react';

import CloseButton from '../../elements/CloseButton';

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
    input,
    button {
      padding: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      height: 36px;
      margin: 2px;
    }
    input {
      flex: 10;
    }
    button {
      flex: 2;
      color: white;
      background-color: gray;
    }
  }
`;

interface NumberInputProps {
  onSave?: (element: any) => void;
  onClose: () => void;
  header: any;
}

export default function NumberInput({
  onSave,
  onClose,
  header,
}: NumberInputProps) {
  const valueReft = useRef<any>(null);

  const saveHandler = useCallback(() => {
    onSave?.(valueReft.current.value);
  }, [onSave]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onSave?.(valueReft.current.value);
      }
    },
    [onSave],
  );

  return (
    <div css={styles}>
      <div className="header handle">
        <span>{header}</span>

        <CloseButton onClick={onClose} />
      </div>
      <div className="container">
        <input
          ref={valueReft}
          type="number"
          placeholder="Enter the new value"
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={saveHandler}>
          Set
        </button>
      </div>
    </div>
  );
}
