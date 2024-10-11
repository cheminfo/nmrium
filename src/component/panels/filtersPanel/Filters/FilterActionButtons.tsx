import { Button, ButtonProps } from '@blueprintjs/core';
import styled from '@emotion/styled';

interface FilterActionButtonsProps {
  onConfirm: ButtonProps['onClick'];
  disabledConfirm?: boolean;
  onCancel: ButtonProps['onClick'];
  disabledCancel?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 5px;
`;

export function FilterActionButtons(props: FilterActionButtonsProps) {
  const {
    onConfirm,
    onCancel,
    disabledConfirm = false,
    disabledCancel = false,
  } = props;

  return (
    <Container>
      <Button
        outlined
        intent="success"
        onClick={onConfirm}
        small
        disabled={disabledConfirm}
      >
        Apply
      </Button>
      <Button
        minimal
        intent="danger"
        onClick={onCancel}
        small
        disabled={disabledCancel}
      >
        Cancel
      </Button>
    </Container>
  );
}
