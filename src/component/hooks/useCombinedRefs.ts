import type { ForwardedRef, MutableRefObject, RefCallback } from 'react';
import { useEffect, useRef } from 'react';

export default function useCombinedRefs<T>(
  refs: Array<RefCallback<T> | MutableRefObject<T> | ForwardedRef<T>>,
) {
  const targetRef = useRef<any>();

  useEffect(() => {
    for (const ref of refs) {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        // Mutating a ref.
        // eslint-disable-next-line react-hooks/immutability
        ref.current = targetRef.current;
      }
    }
  }, [refs]);

  return targetRef;
}
