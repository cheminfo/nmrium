import {
  useMemo,
  memo,
  Children,
  cloneElement,
  ReactNode,
  CSSProperties,
} from 'react';

const styles: CSSProperties = {
  width: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '5px 0px',
  color: 'gray',
};

interface TableBodyProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function TableBody({ children, className, style }: TableBodyProps) {
  const mappedChildren = useMemo(() => {
    return Children.map(children, (child: any) =>
      cloneElement(child, {
        style: { borderBottom: '0.55px solid #d8d8d8', ...child.props.style },
      }),
    );
  }, [children]);

  return (
    <div className={className} style={{ ...styles, ...style }}>
      {mappedChildren}
    </div>
  );
}

export default memo(TableBody);
