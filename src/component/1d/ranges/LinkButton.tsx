import { FaLink } from 'react-icons/fa';

import Button, { ButtonProps } from '../../elements/Button';

export interface LinkButtonProps extends Omit<ButtonProps, 'children'> {
  isActive: boolean;
  x?: number;
  y?: number;
  className?: string;
}

export function LinkButton(props: LinkButtonProps) {
  const {
    isActive,
    onClick,
    x = 0,
    y = 5,
    className = 'target',
    ...otherProps
  } = props;
  return (
    <foreignObject width="16px" height="16px" x={x} y={y} className={className}>
      <Button
        theme={isActive ? 'danger' : 'success'}
        style={{ width: '16px', height: '16px', padding: 0 }}
        onClick={onClick}
        {...otherProps}
      >
        <FaLink style={{ fontSize: 9, margin: 'auto' }} />
      </Button>
    </foreignObject>
  );
}
