import { useState } from 'react';

export type UseLiveEdit = ReturnType<typeof useLiveEdit>;

export function useLiveEdit(isLiveEditable: boolean | undefined) {
  const [value, setValue] = useState(() =>
    isLiveEditable
      ? {
          checked: true,
          shouldProcessNext: true,
        }
      : undefined,
  );

  return { value, setValue };
}
