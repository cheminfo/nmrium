import { Button } from '@blueprintjs/core';
import { CSSProperties, MouseEvent } from 'react';

interface ActionButtonsProps {
  onDone: (event?: MouseEvent) => void;
  onCancel: (event?: MouseEvent) => void;
  doneLabel?: string;
  cancelLabel?: string;
  style?: CSSProperties;
}

export default function ActionButtons(props: ActionButtonsProps) {
  const {
    onDone,
    onCancel,
    doneLabel = 'Apply',
    cancelLabel = 'Cancel',
    style = {},
  } = props;
  return (
    <div style={{ margin: '0 10px', display: 'flex', ...style }}>
      <Button
        intent="success"
        onClick={onDone}
        small
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
        small
        outlined
        intent="danger"
        onClick={onCancel}
        style={
          !style.flexDirection || style.flexDirection === 'row'
            ? {
                marginLeft: '10px',
                margin: '10px',
              }
            : {}
        }
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
