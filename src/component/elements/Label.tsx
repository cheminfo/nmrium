/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { CSSProperties, LabelHTMLAttributes, ReactNode } from 'react';

import Button from './Button.js';

export interface LabelStyle {
  label?: CSSProperties;
  wrapper?: CSSProperties;
  container?: CSSProperties;
}
interface LabelProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'style'> {
  title: string;
  renderTitle?: (title: string) => ReactNode;
  shortTitle?: string;
  children: ReactNode;
  className?: string;
  style?: LabelStyle;
  description?: string;
}

export default function Label(props: LabelProps) {
  const {
    title,
    shortTitle,
    className = '',
    children,
    style,
    description,
    renderTitle,
    ...otherProps
  } = props;
  return (
    <label
      style={{ display: 'flex', alignItems: 'center', ...style?.container }}
      {...otherProps}
    >
      <span
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
        {renderTitle ? (
          renderTitle(title)
        ) : (
          <span className={shortTitle ? 'large-label' : ''}>{title}</span>
        )}
        {shortTitle && (
          <span className="small-label" css={css({ display: 'none' })}>
            {shortTitle}
          </span>
        )}
        {description && (
          <Button.Info
            toolTip={description}
            tooltipOrientation="horizontal"
            style={{ display: 'inline-block' }}
            backgroundColor={{ hover: 'white', base: 'white' }}
            color={{ base: 'gray', hover: 'black' }}
          />
        )}
      </span>
      <div style={style?.wrapper}>{children}</div>
    </label>
  );
}
