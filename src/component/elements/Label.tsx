import styled from '@emotion/styled';
import type { CSSProperties, LabelHTMLAttributes, ReactNode } from 'react';

import Button from './Button.js';
import { ContainerQueryWrapper } from './ContainerQueryWrapper.js';
import type { ContainerQueryWrapperProps } from './ContainerQueryWrapper.js';

const ShortTitle = styled.span`
  display: none;
`;

export interface LabelStyle {
  label?: CSSProperties;
  wrapper?: CSSProperties;
  container?: CSSProperties;
}
interface LabelProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'style'>,
    Partial<ContainerQueryWrapperProps> {
  title: string;
  renderTitle?: (title: string, className?: string) => ReactNode;
  shortTitle?: string;
  children: ReactNode;
  className?: string;
  style?: LabelStyle;
  description?: string;
}

export default function Label(props: LabelProps) {
  const {
    narrowClassName = 'small-label',
    wideClassName = 'large-label',
    widthThreshold,
    ...otherProps
  } = props;

  if (typeof widthThreshold === 'number') {
    return (
      <ContainerQueryWrapper
        widthThreshold={widthThreshold}
        wideClassName={wideClassName}
        narrowClassName={narrowClassName}
      >
        <InnerLabel
          {...otherProps}
          wideClassName={wideClassName}
          narrowClassName={narrowClassName}
        />
      </ContainerQueryWrapper>
    );
  }
  return (
    <InnerLabel
      {...otherProps}
      wideClassName={wideClassName}
      narrowClassName={narrowClassName}
    />
  );
}
export function InnerLabel(props: LabelProps) {
  const {
    title,
    shortTitle,
    className = '',
    children,
    style,
    description,
    renderTitle,
    wideClassName,
    narrowClassName,
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
          renderTitle(title, wideClassName)
        ) : (
          <span className={shortTitle ? wideClassName : ''}>{title}</span>
        )}
        {shortTitle && (
          <ShortTitle className={narrowClassName}>{shortTitle}</ShortTitle>
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
