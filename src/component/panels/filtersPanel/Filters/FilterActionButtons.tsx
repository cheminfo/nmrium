import { Button, ButtonProps } from '@blueprintjs/core';

interface FilterActionButtonsProps {
  onConfirm: ButtonProps['onClick'];
  disabledConfirm?: boolean;
  onCancel: ButtonProps['onClick'];
  disabledCancel?: boolean;
}

export function FilterActionButtons(props: FilterActionButtonsProps) {
  const {
    onConfirm,
    onCancel,
    disabledConfirm = false,
    disabledCancel = false,
  } = props;

  return (
    <div style={{ display: 'flex', flexShrink: 0 }}>
      <Button
        minimal
        intent="danger"
        onClick={onCancel}
        small
        disabled={disabledCancel}
      >
        Cancel
      </Button>

      <Button
        outlined
        intent="success"
        onClick={onConfirm}
        small
        disabled={disabledConfirm}
      >
        Save
      </Button>
    </div>
  );
}
