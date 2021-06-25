import { CSSProperties, memo } from 'react';
import { FaTimes } from 'react-icons/fa';

import ToolTip from './ToolTip/ToolTip';

const styles: Record<'button' | 'svg', CSSProperties> = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    fill: '#ca0000',
    fontSize: '16px',
  },
};

interface CloseButtonProps {
  onClick?: () => void;
  popupTitle?: string;
  popupPlacement?: string;
  className?: string;
}

function CloseButton(props: CloseButtonProps) {
  const {
    onClick = () => null,
    popupTitle = 'Close',
    popupPlacement = 'left',
    className = '',
  } = props;
  return (
    <div className={className}>
      <ToolTip title={popupTitle} popupPlacement={popupPlacement}>
        <button style={styles.button} type="button" onClick={onClick}>
          <FaTimes style={styles.svg} />
        </button>
      </ToolTip>
    </div>
  );
}

export default memo(CloseButton);
