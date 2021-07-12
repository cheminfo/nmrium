import { useMemo } from 'react';

import { positions } from './options';

function getStyles(position, containerStyle): any {
  const initialStyles = {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    pointerEvents: 'none',
    overflow: 'visible',
    ...(containerStyle
      ? {
          top: `${containerStyle.top}px`,
          left: `${containerStyle.left}px`,
          height: `${containerStyle.height}px`,
          width: `${containerStyle.width}px`,
        }
      : { width: '100%', height: '100%' }),
  };

  switch (position) {
    case positions.TOP_LEFT:
      return {
        ...initialStyles,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      };
    case positions.TOP_CENTER:
      return {
        ...initialStyles,
        justifyContent: 'flex-start',
      };
    case positions.TOP_RIGHT:
      return {
        ...initialStyles,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      };
    case positions.MIDDLE_LEFT:
      return {
        ...initialStyles,
        justifyContent: 'center',
        alignItems: 'flex-start',
      };
    case positions.MIDDLE: {
      return {
        ...initialStyles,
        justifyContent: 'center',
      };
    }
    case positions.MIDDLE_RIGHT:
      return {
        ...initialStyles,
        justifyContent: 'center',

        alignItems: 'flex-end',
      };

    case positions.BOTTOM_LEFT:
      return {
        ...initialStyles,
        justifyContent: 'flex-end',

        alignItems: 'flex-start',
      };
    case positions.BOTTOM_CENTER:
      return {
        ...initialStyles,
        justifyContent: 'flex-end',
      };
    case positions.BOTTOM_RIGHT:
      return {
        ...initialStyles,
        justifyContent: 'flex-end',

        alignItems: 'flex-end',
      };

    default: {
      return initialStyles;
    }
  }
}

export default function Wrapper({
  children,
  options: { position },
  containerStyle,
  ...props
}) {
  const styles = useMemo(
    () => getStyles(position, containerStyle),
    [position, containerStyle],
  );

  return (
    children.length > 0 && (
      <div style={styles} {...props}>
        {children}
      </div>
    )
  );
}
