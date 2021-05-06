/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

const styles = css`
  display: flex;
  flex-direction: column;
  border-top: 10px solid #ed0000;
  flex: 1;
  border-radius: 5px;

  .message {
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    color: #af0000;
    text-align: center;
    padding: 35px;
    flex: 1;
  }
  .buttons-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 5px;
    border-top: 1px solid #efefef;

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
      color: #363636;
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
  }
`;

const ConfirmationDialog = ({ style, buttons, onClose, message }) => {
  const optionsHandler = useCallback(
    (e, { handler = () => null }) => {
      handler(e);
      onClose();
    },
    [onClose],
  );

  return (
    <div style={style} css={styles}>
      <p className="message">{message}</p>
      <div className="buttons-container">
        {buttons.map((option) => (
          <button
            key={option.text}
            type="button"
            onClick={(e) => optionsHandler(e, option)}
            style={option.style && option.style}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

ConfirmationDialog.defaultProps = {
  buttons: [],
  style: {},
};

ConfirmationDialog.propTypes = {
  style: PropTypes.object,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      handler: PropTypes.func,
      text: PropTypes.string,
      style: PropTypes.object,
    }),
  ),
};

export default ConfirmationDialog;
