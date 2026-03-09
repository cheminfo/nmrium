import styled from '@emotion/styled';
import type { ButtonProps } from 'react-science/ui';
import { Button } from 'react-science/ui';

export const CellActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  margin-left: 3px;
  margin-right: 2px;
`;

export function CellActionsButton(props: ButtonProps) {
  const { size = 'small', variant = 'minimal' } = props;

  return <Button {...props} size={size} variant={variant} />;
}
