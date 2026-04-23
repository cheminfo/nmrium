import type { InputHTMLAttributes } from 'react';

interface ColumnWrapperProps extends InputHTMLAttributes<HTMLDivElement> {
  stopPropagation?: boolean;
}

export function ColumnWrapper(props: ColumnWrapperProps) {
  const { stopPropagation = true, children, ...otherProps } = props;
  return (
    <div
      {...otherProps}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
