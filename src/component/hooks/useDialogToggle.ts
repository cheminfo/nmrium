import { useState } from 'react';

export function useDialogToggle<T = Record<string, boolean>>(initState: T) {
  const [dialog, setDialogState] = useState<T>(initState);

  function openDialog(id: keyof T) {
    const newState = { ...dialog, [id]: true };
    setDialogState(newState);
  }

  function closeDialog() {
    const newState = {} as T;
    for (const id in dialog) {
      newState[id as string] = false;
    }
    setDialogState(newState);
  }

  return { dialog, closeDialog, openDialog };
}
