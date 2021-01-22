import { memo } from 'react';

const styles = {
  width: '100%',
  display: 'flex',
  padding: '5px 0px',
};
function TableHeader({ children, className, style, onClick }) {
  return (
    <div
      className={className}
      style={{ ...styles, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

TableHeader.defaultProps = {
  onClick: () => null,
};

export default memo(TableHeader);
