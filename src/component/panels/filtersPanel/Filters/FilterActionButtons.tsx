import { Button, ButtonProps } from '@blueprintjs/core';

interface FilterActionButtonsProps {
  onConfirm: ButtonProps['onClick'];
  onCancel: ButtonProps['onClick'];
}

export function FilterActionButtons(props: FilterActionButtonsProps) {
  const { onConfirm, onCancel } = props;

  return (
    <div style={{ display: 'flex', flexShrink: 0 }}>
      <Button minimal intent="danger" onClick={onCancel} small>
        Cancel
      </Button>

      <Button outlined intent="success" onClick={onConfirm} small>
        Save
      </Button>
    </div>
  );
}
