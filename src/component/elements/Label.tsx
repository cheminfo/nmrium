import React, { CSSProperties, ReactNode } from 'react';

export interface LabelStyle {
  label?: CSSProperties;
  wrapper?: CSSProperties;
  container?: CSSProperties;
}
interface LabelProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'style'> {
  title: string;
  children: ReactNode;
  className?: string;
  style?: LabelStyle;
}

export default function Label(props: LabelProps) {
  const { title, className = '', children, style, ...otherProps } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style?.container }}>
      <label
        className={className}
        style={{
          fontSize: '12px',
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
