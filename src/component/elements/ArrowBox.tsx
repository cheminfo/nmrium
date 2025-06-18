import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type ArrowPosition = 'top' | 'bottom' | 'left' | 'right';

function getInvertedPosition(position: ArrowPosition) {
  switch (position) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return 'top';
  }
}
interface ArrowBoxProps {
  position: ArrowPosition;
  size?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  children: ReactNode;
}
export const ArrowBox = styled.div<ArrowBoxProps>((options) => {
  const {
    position,
    size = 5,
    backgroundColor = 'white',
    borderWidth = 0,
    borderColor = 'black',
  } = options;
  const inverted = getInvertedPosition(position);
  const borderSize = size + Math.round(borderWidth * Math.SQRT2);
  const isVertical = position === 'top' || position === 'bottom';
  const translate = isVertical ? 'translateX(-50%)' : 'translateY(-50%)';

  return {
    position: 'relative',
    background: backgroundColor,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
    padding: '5px',
    borderRadius: '4px',
    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px',

    '&::after': {
      content: '""',
      position: 'absolute',
      [inverted]: '100%',
      [isVertical ? 'left' : 'top']: '50%',
      transform: translate,
      border: 'solid transparent',
      borderWidth: size,
      [`border${inverted.charAt(0).toUpperCase() + inverted.slice(1)}Color`]:
        backgroundColor,
      pointerEvents: 'none',
    },

    ...(borderWidth > 0 && {
      '&::before': {
        content: '""',
        position: 'absolute',
        [inverted]: '100%',
        [isVertical ? 'left' : 'top']: '50%',
        transform: translate,
        border: 'solid transparent',
        borderWidth: borderSize,
        [`border${inverted.charAt(0).toUpperCase() + inverted.slice(1)}Color`]:
          borderColor,
        pointerEvents: 'none',
      },
    }),
  };
});
