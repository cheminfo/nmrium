import { LegacyRef, MutableRefObject, useEffect, useRef } from 'react';

export default function useCombinedRefs(
  refs: Array<MutableRefObject<any> | LegacyRef<any>>,
) {
  const targetRef = useRef<any>();

  useEffect(() => {
    for (const ref of refs) {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as MutableRefObject<any>).current = targetRef.current;
      }
    }
  }, [refs]);

  return targetRef;
}
