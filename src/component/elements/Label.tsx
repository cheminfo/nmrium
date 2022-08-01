import React, { CSSProperties, ReactNode } from 'react';

interface LabelProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'style'> {
  title: string;
  children: ReactNode;
  className?: string;
  style?: {
    label?: CSSProperties;
    wrapper?: CSSProperties;
  };
}

export default function Label(props: LabelProps) {
  const { title, className = '', children, style, ...otherProps } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label
        className={className}
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#232323',
          paddingRight: '10px',
          width: 'max-content',
          ...style?.label,
        }}
        {...otherProps}
      >
        {title}
      </label>
      <div style={style?.wrapper}>{children}</div>
    </div>
  );
}
