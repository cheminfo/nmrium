/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaTimes } from 'react-icons/fa';

import { types } from '../options';

import { Alert } from './Context';
import ProgressIndicator from './ProgressIndicator';

interface AlertBlockProps {
  offset: string;
  alert: Alert;
  onClose: () => void;
}

const style = css`
  padding: 25px;
  border-radius: 10px;
  pointer-events: all;
  min-height: 60px;
  position: relative;

  > button {
    position: absolute;
    right: 5px;
    top: 5px;
    border: none;
    background-color: transparent;
    color: white;
  }
`;

export default function AlertBlock(props: AlertBlockProps) {
  const { offset, alert, onClose } = props;
  return (
    <div
      key={alert.id}
      css={style}
      style={{
        margin: offset,
        backgroundColor: alert.options.backgroundColor,
        color: alert.options.color,
      }}
    >
      <button type="button" onClick={onClose}>
        <FaTimes />
      </button>

      <span>{alert.message}</span>
      {alert.options.type === types.PROGRESS_INDICATOR && <ProgressIndicator />}
    </div>
  );
}
