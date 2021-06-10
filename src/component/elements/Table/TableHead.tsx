import { CSSProperties, memo, ReactNode } from 'react';

const styles: CSSProperties = {
  width: '100%',
  display: 'flex',
  padding: '0px 5px',
  color: '#424242',
  backgroundColor: '#d8d8d8',
  borderBottom: '0.55px solid #d8d8d8',
  fontSize: 11,
  fontWeight: 'bold',
};

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function TableHead({ children, className, style }: TableHeadProps) {
  return (
    <div className={className} style={{ ...styles, ...style }}>
      {children}
    </div>
  );
}

export default memo(TableHead);
