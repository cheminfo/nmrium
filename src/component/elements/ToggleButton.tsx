/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, memo, ReactNode, useCallback, useState } from 'react';

import ToolTip from './ToolTip/ToolTip';

const styles = css`
  background-color: transparent;
  border: none;
  border-radius: 5px;

  &:hover {
    background-color: lightgray;
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
  const [flag, Toggle] = useState<boolean>(defaultValue);

  const toggleHandler = useCallback(() => {
    onClick(!flag);

    Toggle(!flag);
  }, [onClick, flag]);
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <button
        disabled={disabled}
        css={styles}
        style={style}
        className={(flag ? 'toggle toggle-active ' : 'toggle ') + className}
        type="button"
        onClick={toggleHandler}
      >
        {children}
      </button>
    </ToolTip>
  );
}

export default memo(ToggleButton);
