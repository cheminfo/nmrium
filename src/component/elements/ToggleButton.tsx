/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, memo, ReactNode, useCallback, useState } from 'react';

import ToolTip from './ToolTip/ToolTip';

const styles = css`
  background-color: #f5f5f5;
  border: none;
  border-radius: 5px;

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
  testID?: string;
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
  testID,
}: ToggleButtonProps) {
  const [flag, Toggle] = useState<boolean>(defaultValue);

  const toggleHandler = useCallback(() => {
    onClick(!flag);

    Toggle(!flag);
  }, [onClick, flag]);
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <button
        data-test-id={testID}
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
