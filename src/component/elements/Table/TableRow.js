import React from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  padding: '5px 0px',
};
const TableHeader = ({ children, className, style }) => {
  return (
    <div className={className} style={{ ...styles, style }}>
      {children}
    </div>
  );
};

export default TableHeader;
