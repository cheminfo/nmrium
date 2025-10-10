import { useState } from 'react';

export function useDialogToggle<T extends Record<string, boolean>>(
  initState: T,
) {
  const [dialog, setDialogState] = useState<T>(initState);

  function openDialog(id: keyof T) {
    setDialogState((currentState) => ({ ...currentState, [id]: true }));
  }

  function closeDialog() {
    setDialogState(
      (currentState) =>
        Object.fromEntries(
          Object.entries(currentState).map(([key]) => [key as keyof T, false]),
        ) as T,
    );
  }

  return { dialog, closeDialog, openDialog };
}
