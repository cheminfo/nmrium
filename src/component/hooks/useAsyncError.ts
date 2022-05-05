import { useCallback, useState } from 'react';

export function useAsyncError() {
  const [, setError] = useState();
  return useCallback(
    (e) => {
      e.metadata = { isControlled: true };
      e.name = 'ControlledError';
      setError(() => {
        throw e;
      });
    },
    [setError],
  );
}
