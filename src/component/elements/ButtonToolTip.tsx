import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

import ToolTip from './ToolTip/ToolTip.js';

interface ButtonToolTipProps
  extends Omit<InputHTMLAttributes<HTMLButtonElement>, 'type'> {
  popupTitle?: string;
  popupPlacement?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function ButtonToolTip({
  children,
  style = { padding: '5px' },
  onClick = () => null,
  popupTitle = '',
  popupPlacement = 'right',
  ...props
}: ButtonToolTipProps) {
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <button
        style={{ ...style, opacity: props?.disabled ? '0.2' : '1' }}
        type="button"
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    </ToolTip>
  );
}

export default ButtonToolTip;
