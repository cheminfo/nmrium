import React, { CSSProperties, ReactNode } from 'react';

interface LabelProps {
  title: string;
  children: ReactNode;
  className?: string;
  style?: {
    label?: CSSProperties;
    wrapper?: CSSProperties;
  };
}

export default function Label(props: LabelProps) {
  const { title, className = '', children, style } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        className={className}
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#232323',
          paddingRight: '10px',
          width: 'max-content',
          ...style?.label,
        }}
      >
        {title}
      </span>
      <div style={style?.wrapper}>{children}</div>
    </div>
  );
}
