import { useRef, useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FaTimes } from 'react-icons/fa';

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

const IntegralSumModal = ({ onSave, onClose }) => {
  const valueReft = useRef();

  const saveHandler = useCallback(() => {
    onSave(valueReft.current.value);
  }, [onSave]);

  return (
    <div css={styles}>
      <div className="header">
        <span>Change Integral sum Dialog</span>
        <button onClick={onClose} type="button">
          <FaTimes />
        </button>
      </div>
      <div className="container">
        <input
          ref={valueReft}
          type="number"
          placeholder="Enter the integral sum"
        />
        <button type="button" onClick={saveHandler}>
          save
        </button>
      </div>
    </div>
  );
};

IntegralSumModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
};
export default IntegralSumModal;
