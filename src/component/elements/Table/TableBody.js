import React from 'react';

const styles = {
  width: '100%',
  overflowY: 'scroll',
  display: 'flex',
  flexDirection: 'column',
  padding: '5px 0px',
  color: 'gray',
  borderBottom: '0.55px solid #d8d8d8',
};
const TableBody = ({ children, className, style }) => {
  return (
    <div className={className} style={{ ...styles, style }}>
      {children}
    </div>
  );
};

export default TableBody;
