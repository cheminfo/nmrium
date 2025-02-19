import styled from '@emotion/styled';
import type { CSSProperties, ReactNode } from 'react';
import { memo, useCallback, useState } from 'react';

import ToolTip from './ToolTip/ToolTip.js';

const Button = styled.button`
  background-color: #f5f5f5;
  border: none;
  border-radius: 5px;
  padding: 5px;

  &:hover {
    background-color: lightgray !important;
    color: black !important;
  }

  &.toggle-active {
    background-color: gray;
    color: white;
  }
`;

interface ToggleButtonProps {
  popupTitle: string;
  popupPlacement: string;
  style?: CSSProperties;
  defaultValue?: boolean;
  onClick: (element: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function ToggleButton({
  children,
  style = {},
  onClick = () => null,
  popupTitle = '',
  popupPlacement = 'right',
  defaultValue = false,
  disabled = false,
  className = '',
}: ToggleButtonProps) {
  const [flag, toggle] = useState<boolean>(defaultValue);

  const toggleHandler = useCallback(() => {
    onClick(!flag);

    toggle(!flag);
  }, [onClick, flag]);
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <Button
        disabled={disabled}
        style={style}
        className={(flag ? 'toggle toggle-active ' : 'toggle ') + className}
        type="button"
        onClick={toggleHandler}
      >
        {children}
      </Button>
    </ToolTip>
  );
}

export default memo(ToggleButton);
