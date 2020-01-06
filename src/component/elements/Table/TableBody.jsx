import React from 'react';

const styles = {
  width: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '5px 0px',
  color: 'gray',
};
const TableBody = ({ children, className, style }) => {
  return (
    <div className={className} style={{ ...styles, style }}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          style: { borderBottom: '0.55px solid #d8d8d8' },
        }),
      )}
    </div>
  );
};

export default TableBody;
