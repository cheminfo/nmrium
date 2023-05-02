import { CSSProperties } from 'react';
import { FaLink, FaMinus } from 'react-icons/fa';

import Button, { ButtonProps } from '../../elements/Button';

const styles: Record<'button' | 'icon', CSSProperties> = {
  button: { width: '16px', height: '16px', padding: 0 },
  icon: { fontSize: 9, margin: 'auto' },
};
export interface AssignmentActionsButtonsProps
  extends Omit<ButtonProps, 'children' | 'onClick'> {
  isActive: boolean;
  x?: number;
  y?: number;
  className?: string;
  onAssign: ButtonProps['onClick'];
  onUnAssign: ButtonProps['onClick'];
}

export function AssignmentActionsButtons(props: AssignmentActionsButtonsProps) {
  const {
    isActive,
    onAssign,
    onUnAssign,
    x = 0,
    y = 5,
    className = 'target',
    ...otherProps
  } = props;
  return (
    <foreignObject
      width="16px"
      height="34px"
      x={x}
      y={y}
      className={className}
      data-no-export="true"
    >
      <Button
        theme="success"
        style={styles.button}
        onClick={onAssign}
        {...otherProps}
      >
        <FaLink style={styles.icon} />
      </Button>
      {isActive && (
        <Button
          theme="danger"
          style={{ ...styles.button, marginTop: '2px' }}
          onClick={onUnAssign}
          {...otherProps}
        >
          <FaMinus style={styles.icon} />
        </Button>
      )}
    </foreignObject>
  );
}
