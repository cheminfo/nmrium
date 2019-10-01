import React from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  padding: '5px 0px',
  color: '#424242',
  backgroundColor: '#f3f3f3',
  borderBottom: '0.55px solid #d8d8d8',
};
const TableHead = ({ children, className, style }) => {
  return (
    <div className={className} style={{ ...styles, style }}>
      {children}
    </div>
  );
};

export default TableHead;
