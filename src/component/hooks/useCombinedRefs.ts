import type { RefCallback, RefObject } from 'react';
import { useEffect, useRef } from 'react';

export default function useCombinedRefs<T>(
  refs: Array<RefCallback<T> | RefObject<T> | undefined | null>,
) {
  const targetRef = useRef<any>(undefined);

  useEffect(() => {
    for (const ref of refs) {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    }
  }, [refs]);

  return targetRef;
}
