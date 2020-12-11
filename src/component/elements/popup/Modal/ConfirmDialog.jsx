/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

const messageStyle = css`
  font-size: 16px;
  text-align: center;
  color: white;
  text-align: center;
  margin: 35px 10px;
  flex: 1;
`;
const buttonsStyle = css`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 5px;
  background-color: #ffffff52;

  button:first-of-type {
    border-radius: 5px 0 0 5px;
    border-weight: 0 1px 0 0;
  }
  button:last-child {
    border-radius: 0px 5px 5px 0px;
    border-weight: 0 0 0 1px;
  }
  button {
    border: 1px solid #dcdcdc;
    background-color: white;
    display: inline-block;
    cursor: pointer;
    color: #666666;
    font-weight: bold;
    padding: 6px 24px;
    text-decoration: none;
  }
  button:hover {
    background: -webkit-gradient(
      linear,
      left top,
      left bottom,
      color-stop(0.05, #f6f6f6),
      color-stop(1, #ffffff)
    );
    background: -moz-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -webkit-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -o-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -ms-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#f6f6f6', endColorstr='#ffffff',GradientType=0);
    background-color: #f6f6f6;
  }
`;

const ConfirmationDialog = ({ onYes, onNo, onClose, message }) => {
  const yesHandler = useCallback(
    (e) => {
      onYes(e);
      onClose();
    },
    [onClose, onYes],
  );

  const noHandler = useCallback(
    (e) => {
      onNo(e);
      onClose();
    },
    [onClose, onNo],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ff3636',
        flex: 1,
      }}
    >
      <p css={messageStyle}>{message}</p>
      <div css={buttonsStyle}>
        <button type="button" onClick={noHandler}>
          No
        </button>
        <button type="button" onClick={yesHandler}>
          Yes
        </button>
      </div>
    </div>
  );
};

ConfirmationDialog.defaultProps = {
  onYes: () => {
    return null;
  },
  onNo: () => {
    return null;
  },
};

ConfirmationDialog.propTypes = {
  onYes: PropTypes.func,
  onNo: PropTypes.func,
};

export default ConfirmationDialog;
