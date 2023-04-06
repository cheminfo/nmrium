import { FaLink } from 'react-icons/fa';

import Button, { ButtonProps } from '../../elements/Button';

interface LinkButtonProps {
  isActive: boolean;
  onLink: ButtonProps['onClick'];
  x?: number;
  y?: number;
  className?: string;
}

export function LinkButton(props: LinkButtonProps) {
  const { isActive, onLink, x = 0, y = 0, className = 'target' } = props;
  return (
    <foreignObject width="16px" height="16px" x={x} y={y} className={className}>
      <Button
        theme={isActive ? 'danger' : 'success'}
        style={{ width: '16px', height: '16px', padding: 0 }}
        onClick={onLink}
      >
        <FaLink style={{ fontSize: 9, margin: 'auto' }} />
      </Button>
    </foreignObject>
  );
}
