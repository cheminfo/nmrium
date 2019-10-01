import React from 'react';

const styles = {
  width: '100%',
};
const TableHeader = ({
  children,
  className,
  style,
  align = 'center',
  size = 1,
}) => {
  return (
    <div
      className={className}
      style={{ ...styles, textAlign: align, flex: size, ...style }}
    >
      {children}
    </div>
  );
};

export default TableHeader;
