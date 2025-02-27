import styled from '@emotion/styled';
import type { CSSProperties, ReactNode } from 'react';
import { memo, useCallback } from 'react';

import ToolTip from './ToolTip/ToolTip.js';

const Button = styled.button`
  background-color: #f5f5f5;
  border: none;
  border-radius: 5px;
  padding: 5px;

  &:disabled {
    opacity: 0.3;
  }

  &:not([disabled]) {
    &:hover {
      background-color: lightgray !important;
      color: black !important;
    }

    &.toggle-active {
      background-color: gray;
      color: white;
    }
  }
`;

export interface ActiveButtonProps {
  /**
   * The state of the button
   */
  value: boolean;
  popupTitle: string;
  popupPlacement: string;
  style?: CSSProperties;
  onClick: (value: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function ActiveButton({
  children,
  style = {},
  onClick = () => null,
  popupTitle = '',
  popupPlacement = 'right',
  disabled = false,
  className = '',
  value,
}: ActiveButtonProps) {
  const toggleHandler = useCallback(() => {
    onClick(!value);
  }, [onClick, value]);
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <Button
        disabled={disabled}
        style={style}
        className={(value ? 'toggle toggle-active ' : 'toggle ') + className}
        type="button"
        onClick={toggleHandler}
      >
        {children}
      </Button>
    </ToolTip>
  );
}

export default memo(ActiveButton);
