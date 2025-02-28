import { Button } from '@blueprintjs/core';
import type { CSSProperties, MouseEvent } from 'react';

interface ActionButtonsProps {
  onDone: (event?: MouseEvent) => void;
  onCancel: (event?: MouseEvent) => void;
  doneLabel?: string;
  cancelLabel?: string;
  style?: CSSProperties;
  disabledDone?: boolean;
}

export default function ActionButtons(props: ActionButtonsProps) {
  const {
    onDone,
    onCancel,
    doneLabel = 'Apply',
    cancelLabel = 'Cancel',
    style = {},
    disabledDone = false,
  } = props;
  return (
    <div style={{ margin: '0 10px', display: 'flex', ...style }}>
      <Button
        disabled={disabledDone}
        intent="success"
        onClick={onDone}
        style={
          style?.flexDirection === 'row-reverse'
            ? {
                marginLeft: '10px',
              }
            : {}
        }
      >
        {doneLabel}
      </Button>
      <Button
        variant="outlined"
        intent="danger"
        onClick={onCancel}
        style={
          !style.flexDirection || style.flexDirection === 'row'
            ? {
                marginLeft: '10px',
              }
            : {}
        }
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
