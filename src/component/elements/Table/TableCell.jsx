import React from 'react';

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
const TableHeader = ({
  children,
  className,
  style,
  align = 'center',
  vAlign = 'center',
  size = 1,
}) => {
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
    >
      {children}
    </div>
  );
};

export default TableHeader;
