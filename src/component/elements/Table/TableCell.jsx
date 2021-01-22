import { memo } from 'react';

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
function TableHeader({
  children,
  className,
  style,
  align = 'center',
  vAlign = 'center',
  size = 1,
  onClick,
}) {
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
