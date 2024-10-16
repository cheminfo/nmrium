import type { IconName, TooltipProps } from '@blueprintjs/core';
import { Icon, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactNode } from 'react';

interface IconButtonProps extends React.SVGAttributes<SVGElement> {
  size?: number;
  padding?: number;
  icon?: IconName;
  backgroundColor?: CSSProperties['backgroundColor'];
  color?: CSSProperties['color'];
  title?: string;
  tooltipProps?: TooltipProps;
  renderIcon?: (props: Pick<IconButtonProps, 'color' | 'size'>) => ReactNode;
}

export function SVGButton(props: IconButtonProps) {
  const {
    size = 16,
    padding = 5,
    className,
    icon,
    renderIcon,
    backgroundColor = 'gray',
    color = 'white',
    title,
    tooltipProps,
    ...otherProps
  } = props;
  return (
    <Tooltip
      content={title}
      compact
      targetTagName="g"
      placement="auto-end"
      {...tooltipProps}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        {...otherProps}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={backgroundColor}
        />
        <g transform={`translate(${padding / 2} ${padding / 2})`}>
          {typeof renderIcon === 'function' ? (
            renderIcon({ size: size - padding, color })
          ) : (
            <Icon tagName="g" icon={icon} size={size - padding} color={color} />
          )}
        </g>
      </svg>
    </Tooltip>
  );
}
