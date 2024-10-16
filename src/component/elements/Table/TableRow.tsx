import type { CSSProperties, ReactNode } from 'react';
import { memo } from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  padding: '5px 0px',
};

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

function TableHeader({
  children,
  className,
  style,
  onClick = () => null,
}: TableHeaderProps) {
  return (
    <div
      className={className}
      style={{ ...styles, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default memo(TableHeader);
