import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useDispatch } from '../../context/DispatchContext.js';
import { useViewportSize } from '../../hooks/useViewportSize.js';

interface ViewerResponsiveWrapperProps {
  width: number;
  height: number;
  children: ReactNode;
}

export function ViewerResponsiveWrapper(props: ViewerResponsiveWrapperProps) {
  const dispatch = useDispatch();
  const { width, height, children } = props;
  const size = useViewportSize();

  useEffect(() => {
    if (!size) {
      dispatch({ type: 'SET_DIMENSIONS', payload: { width, height } });
    }
  }, [width, height, dispatch, size]);

  return children;
}
