import { useState } from 'react';

export type UseLiveEdit = ReturnType<typeof useLiveEdit>;

export function useLiveEdit(
  isLiveEditable: boolean | undefined,
  defaultShouldProcessNext: boolean | undefined,
) {
  const [value, setValue] = useState(() =>
    isLiveEditable
      ? {
          checked: true,
          shouldProcessNext: defaultShouldProcessNext ?? false,
        }
      : undefined,
  );

  return { value, setValue };
}
