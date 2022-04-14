import { CSSProperties, MouseEvent } from 'react';

import Button from './Button';

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
      <Button.Done
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
      </Button.Done>
      <Button.Danger
        fill="outline"
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
      </Button.Danger>
    </div>
  );
}
