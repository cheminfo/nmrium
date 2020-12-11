import { useMemo, memo, Children, cloneElement } from 'react';

const styles = {
  width: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '5px 0px',
  color: 'gray',
};
const TableBody = memo(({ children, className, style }) => {
  const mappedChildren = useMemo(() => {
    return Children.map(children, (child) =>
      cloneElement(child, {
        style: { borderBottom: '0.55px solid #d8d8d8', ...child.props.style },
      }),
    );
  }, [children]);

  return (
    <div className={className} style={{ ...styles, style }}>
      {mappedChildren}
    </div>
  );
});

export default TableBody;
