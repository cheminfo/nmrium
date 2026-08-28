import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/**
 * UI error rendering does not apply in this context.
 * Used for error boundaries in chart tree.
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
