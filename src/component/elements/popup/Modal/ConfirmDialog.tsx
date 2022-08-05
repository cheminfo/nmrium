/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, useCallback } from 'react';

const styles = css`
  display: block;
  border-radius: 5px;
  overflow: hidden;
  width: 350px;
  border-top: 10px solid #ed0000;

  .message {
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    color: #af0000;
    text-align: center;
    padding: 25px;
    display: block;
  }
  .buttons-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-end;
    padding: 5px;
    border-top: 1px solid #efefef;

    button:last-of-type {
      border-radius: 5px 0 0 5px;
    }
    button:first-of-type {
      border-radius: 0px 5px 5px 0px;
      border-width: 1px;
    }
    button {
      border-color: #dcdcdc;
      border-width: 1px 0px 1px 1px;
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

interface ConfirmationDialogProps {
  style?: CSSProperties;
  buttons: Array<{ handler: () => void; text: string; style?: CSSProperties }>;
  onClose: () => void;
  message: string;
}

function ConfirmationDialog({
  style = {},
  buttons = [],
  onClose,
  message,
}: ConfirmationDialogProps) {
  const optionsHandler = useCallback(
    (
      e: React.MouseEvent,
      { handler = () => null }: { handler: (e: React.MouseEvent) => void },
    ) => {
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
}

export default ConfirmationDialog;
