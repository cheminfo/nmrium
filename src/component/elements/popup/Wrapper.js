import { useMemo } from 'react';

import { positions } from './options';

export const getStyles = (position, props) => {
  const initialStyles = {
    // left: 0,
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    // width: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
    ...(props.containerStyle
      ? {
          top: `${props.containerStyle.top}px`,
          left: `${props.containerStyle.left}px`,
          height: `${props.containerStyle.height}px`,
          width: `${props.containerStyle.width}px`,
        }
      : { width: '100%', height: '100%' }),
  };

  switch (position) {
    case positions.TOP_LEFT:
      return {
        ...initialStyles,
        // top: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      };
    case positions.TOP_CENTER:
      return {
        ...initialStyles,
        justifyContent: 'flex-start',

        // top: 0,
      };
    case positions.TOP_RIGHT:
      return {
        ...initialStyles,
        // top: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      };
    case positions.MIDDLE_LEFT:
      return {
        ...initialStyles,
        // top: '50%',
        justifyContent: 'center',
        alignItems: 'flex-start',
      };
    case positions.MIDDLE: {
      return {
        ...initialStyles,
        // top: '50%',
        justifyContent: 'center',
      };
    }
    case positions.MIDDLE_RIGHT:
      return {
        ...initialStyles,
        // top: '50%',
        justifyContent: 'center',

        alignItems: 'flex-end',
      };

    case positions.BOTTOM_LEFT:
      return {
        ...initialStyles,
        // bottom: 0,
        justifyContent: 'flex-end',

        alignItems: 'flex-start',
      };
    case positions.BOTTOM_CENTER:
      return {
        ...initialStyles,
        // bottom: 0,
        justifyContent: 'flex-end',
      };
    case positions.BOTTOM_RIGHT:
      return {
        ...initialStyles,
        // bottom: 0,
        justifyContent: 'flex-end',

        alignItems: 'flex-end',
      };

    default: {
      return initialStyles;
    }
  }
};

function Wrapper({ children, options: { position }, ...props }) {
  const styles = useMemo(() => getStyles(position, props), [position, props]);

  return (
    children.length > 0 && (
      <div style={styles} {...props}>
        {children}
      </div>
    )
  );
}

export default Wrapper;
