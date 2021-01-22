import { memo } from 'react';

const styles = {
  width: '100%',
  height: '100%',
  padding: '0px',
  display: 'flex',
  flexDirection: 'column',
};
function Table({ children, className, style }) {
  return (
    <div className={className} style={{ ...styles, ...style }}>
      {children}
    </div>
  );
}

export default memo(Table);
