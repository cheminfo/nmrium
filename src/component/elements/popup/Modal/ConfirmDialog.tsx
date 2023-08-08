/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, ReactNode, useCallback } from 'react';

const styles = css`
  display: block;
  border-radius: 5px;
  overflow: hidden;
  width: 30vw;
  min-width: 350px;
  border-top: 10px solid #ed0000;

  .message {
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    color: #af0000;
    padding: 25px;
    display: block;
  }

  .buttons-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-end;
    padding: 5px;
    border-top: 1px solid #efefef;

    button {
      border-color: #dcdcdc;
      border-width: 1px 0 1px 1px;
      background-color: white;
      display: inline-block;
      cursor: pointer;
      color: #363636;
      font-weight: bold;
      padding: 6px 24px;
      text-decoration: none;
    }

    button:hover {
      background: linear-gradient(to bottom, #f6f6f6 5%, #fff 100%);
      background-color: #f6f6f6;
    }

    button:first-of-type {
      border-radius: 0 5px 5px 0;
      border-width: 1px;
    }

    button:last-of-type {
      border-radius: 5px 0 0 5px;
    }
  }
`;

interface AlertButtonOptions {
  handler: (e: React.MouseEvent) => void;
  text: string;
  style?: CSSProperties;
  preventClose?: boolean;
}
interface ConfirmationDialogProps {
  style?: CSSProperties;
  buttons: AlertButtonOptions[];
  onClose: () => void;
  message: ReactNode;
  render?: (data: { message: ReactNode; className: string }) => ReactNode;
  id?: string;
}

function ConfirmationDialog({
  style = {},
  buttons = [],
  onClose,
  message,
  render,
  id,
}: ConfirmationDialogProps) {
  const optionsHandler = useCallback(
    (
      e: React.MouseEvent,
      { handler = () => null, preventClose = false }: AlertButtonOptions,
    ) => {
      handler(e);
      if (!preventClose) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div style={style} css={styles} data-testid={id}>
      {render ? (
        render({ message, className: 'message' })
      ) : (
        <p className="message">{message}</p>
      )}
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
