import { CSSProperties, memo, ReactNode } from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
};

function getVAlign(align) {
  if (align.toLowerCase() === 'top') {
    return 'flex-start';
  } else if (align.toLowerCase() === 'bottom') {
    return 'flex-end';
  }
  return 'center';
}

interface TableHeaderProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  align?: CSSProperties['textAlign'];
  vAlign?: 'center' | 'top' | 'bottom';
  size?: number;
  onClick?: () => void;
}

function TableHeader({
  children,
  className,
  style,
  align = 'center',
  vAlign = 'center',
  size = 1,
  onClick = () => null,
}: TableHeaderProps) {
  return (
    <div
      className={className}
      style={{
        ...styles,
        alignItems: getVAlign(vAlign),
        textAlign: align,
        flex: size,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default memo(TableHeader);
