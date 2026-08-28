import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/**
 * SVG context. No friendly error rendering method.
 *
 * @param props
 */
export function LogError(props: FallbackProps) {
  const { error } = props;

  useEffect(() => {
    reportError(error);
  }, [error]);

  return null;
}
