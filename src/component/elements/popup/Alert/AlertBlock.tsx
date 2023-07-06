import { FaTimes } from 'react-icons/fa';

import { types } from '../options';

import ProgressIndicator from './ProgressIndicator';

interface AlertBlockProps {
  offset: string;
  alert: any;
  onClose: () => void;
}

export default function AlertBlock(props: AlertBlockProps) {
  const { offset, alert, onClose } = props;
  return (
    <div
      style={{
        margin: offset,
        padding: '25px',
        borderRadius: '10px',
        pointerEvents: 'all',
        backgroundColor: alert.options.backgroundColor,
        color: alert.options.color,
        minHeight: '60px',
        position: 'relative',
      }}
      key={alert.id}
    >
      <button
        style={{
          position: 'absolute',
          right: '5px',
          top: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'white',
        }}
        type="button"
        onClick={onClose}
      >
        <FaTimes />
      </button>

      <span>{alert.message}</span>
      {alert.options.type === types.PROGRESS_INDICATOR && <ProgressIndicator />}
    </div>
  );
}
