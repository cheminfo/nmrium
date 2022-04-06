import { MouseEvent } from 'react';

import Button from '../elements/Button';

interface HeaderActionButtonsProps {
  onApply: (event?: MouseEvent) => void;
  onCancel: (event?: MouseEvent) => void;
}

export default function HeaderActionButtons({
  onApply,
  onCancel,
}: HeaderActionButtonsProps) {
  return (
    <div style={{ marginLeft: 10, marginRight: 10, display: 'flex' }}>
      <Button.Done onClick={onApply} borderRadius="0.3rem">
        Apply
      </Button.Done>

      <Button.Danger
        fill="outline"
        onClick={onCancel}
        borderRadius="0.3rem"
        style={{ marginLeft: '10px' }}
      >
        Cancel
      </Button.Danger>
    </div>
  );
}
