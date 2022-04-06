import { MouseEvent } from 'react';

import Button from '../elements/Button';

interface HeaderActionButtonsProps {
  onApply: (event?: MouseEvent) => void;
  onCancel: (event?: MouseEvent) => void;
  applyLabel?: string;
  cancelLabel?: string;
  applyDataTestId?: string;
}

export default function HeaderActionButtons(props: HeaderActionButtonsProps) {
  const {
    onApply,
    onCancel,
    applyLabel = 'Apply',
    cancelLabel = 'Cancel',
    applyDataTestId,
  } = props;
  return (
    <div style={{ marginLeft: 10, marginRight: 10, display: 'flex' }}>
      <Button.Done
        onClick={onApply}
        borderRadius="0.3rem"
        data-test-id={applyDataTestId}
      >
        {applyLabel}
      </Button.Done>

      <Button.Danger
        fill="outline"
        onClick={onCancel}
        borderRadius="0.3rem"
        style={{ marginLeft: '10px' }}
      >
        {cancelLabel}
      </Button.Danger>
    </div>
  );
}
