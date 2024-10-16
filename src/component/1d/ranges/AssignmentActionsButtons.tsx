import type { CSSProperties } from 'react';
import { LuLink, LuUnlink } from 'react-icons/lu';

import type { ButtonProps } from '../../elements/Button.js';
import Button from '../../elements/Button.js';

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
  onAddAssignmentLabel?: ButtonProps['onClick'];
}

export function AssignmentActionsButtons(props: AssignmentActionsButtonsProps) {
  const {
    isActive,
    onAssign,
    onUnAssign,
    onAddAssignmentLabel,
    x = 0,
    y = 5,
    className = 'target',
    ...otherProps
  } = props;
  return (
    <foreignObject
      width="16px"
      height="52px"
      x={x - 16}
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
        <LuLink style={styles.icon} />
      </Button>
      {isActive && (
        <Button
          theme="danger"
          style={{ ...styles.button, marginTop: '2px' }}
          onClick={onUnAssign}
          {...otherProps}
        >
          <LuUnlink style={styles.icon} />
        </Button>
      )}
    </foreignObject>
  );
}
