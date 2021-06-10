import { CSSProperties, memo, ReactNode } from 'react';

const styles: CSSProperties = {
  width: '100%',
  height: '100%',
  padding: '0px',
  display: 'flex',
  flexDirection: 'column',
};

interface TableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Table({ children, className, style }: TableProps) {
  return (
    <div className={className} style={{ ...styles, ...style }}>
      {children}
    </div>
  );
}

export default memo(Table);
