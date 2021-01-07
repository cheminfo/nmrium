import React from 'react';

import ToolTip from './ToolTip/ToolTip';

const ButtonToolTip = ({
  children,
  style,
  onClick,
  popupTitle,
  popupPlacement,
  ...props
}) => {
  return (
    <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
      <button style={style} type="button" onClick={onClick} {...props}>
        {children}
      </button>
    </ToolTip>
  );
};

ButtonToolTip.defaultProps = {
  popupTitle: '',
  popupPlacement: 'right',
  style: {},
  onClick: () => null,
  disabled: false,
};

export default ButtonToolTip;
