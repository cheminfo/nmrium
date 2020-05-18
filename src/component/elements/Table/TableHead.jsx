import React from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  padding: '0px 5px',
  color: '#424242',
  backgroundColor: '#d8d8d8',
  borderBottom: '0.55px solid #d8d8d8',
  fontSize: 11,
  fontWeight: 'bold',
};
const TableHead = ({ children, className, style }) => {
  return (
    <div className={className} style={{ ...styles, ...style }}>
      {children}
    </div>
  );
};

export default TableHead;
