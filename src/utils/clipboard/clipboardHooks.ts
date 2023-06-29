import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { ClipboardMode } from './types';

type PN = PermissionName | 'clipboard-read' | 'clipboard-write';

function supportClipboardReadText(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Boolean(navigator?.clipboard?.readText);
  } catch {
    return false;
  }
}

function supportClipboardRead() {
  try {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Boolean(navigator?.clipboard?.read);
  } catch {
    return false;
  }
}

function supportClipboardWriteText(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Boolean(navigator?.clipboard?.writeText);
  } catch {
    return false;
  }
}

function supportClipboardWrite() {
  try {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Boolean(navigator?.clipboard?.write);
  } catch {
    return false;
  }
}

export interface UsePermissionReturn {
  state: PermissionState | undefined;
  isGranted: boolean;
}

export function useNavigatorPermission(
  now: boolean,
  permissionName: PN,
  onGranted?: () => void,
  onError = reportError,
): UsePermissionReturn {
  const [state, setState] = useState<PermissionState | undefined>();

  useEffect(() => {
    if (!now) return;

    let canceled = false;

    let status: PermissionStatus;
    function onPermissionChange() {
      if (canceled) return;
      setState(status.state);

      if (status.state === 'granted') {
        onGranted?.();
      }
    }

    void navigator.permissions
      .query({ name: permissionName as PermissionName })
      .then((pStatus) => {
        if (canceled) return;
        status = pStatus;

        setState(status.state);
        status.addEventListener('change', onPermissionChange);
      })
      .catch((error) => {
        if (canceled) return;

        onError(error);
      });

    return () => {
      canceled = true;
      if (status) {
        status.removeEventListener('change', onPermissionChange);
      }
    };
  }, [now, permissionName, onGranted, onError]);

  return { state, isGranted: state === 'granted' };
}

async function readText() {
  if (!supportClipboardReadText()) {
    throw new Error('navigator.clipboard.readText() is not supported');
  }
  return navigator.clipboard.readText();
}

async function read() {
  if (!supportClipboardRead()) {
    throw new Error('navigator.clipboard.read() is not supported');
  }
  return navigator.clipboard.read();
}

async function writeText(data: string) {
  if (!supportClipboardWriteText()) {
    throw new Error('navigator.clipboard.writeText() is not supported');
  }
  return navigator.clipboard.writeText(data);
}

async function write(data: ClipboardItems) {
  if (!supportClipboardWrite()) {
    throw new Error('navigator.clipboard.write() is not supported');
  }
  return navigator.clipboard.write(data);
}

export interface UseClipboardReturn {
  read: () => Promise<ClipboardItems | undefined>;
  readText: () => Promise<string | undefined>;
  write: (data: ClipboardItems) => void;
  writeText: (data: string) => void;
  shouldFallback: ClipboardMode | null;
  setShouldFallback: Dispatch<SetStateAction<ClipboardMode | null>>;
}

/**
 * Give you a wrapped clipboard api and a shouldFallback state.
 * ignore if read and readText return promise filled with undefined, and rely on shouldFallback to display an alternative interaction.
 * You should use ClipboardFallback component
 *
 * @example
 * ```tsx
 *   const { readText, shouldFallback, setShouldFallback } = useClipboard();
 *
 *   function handlePasteAction() {
 *     void readText().then(handlePaste);
 *   }
 *
 *   function handlePaste(text: string | undefined) {
 *     if (!text) return;
 *
 *     setState(text);
 *     setShouldFallback(null);
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handlePasteAction}>Paste</button>
 *       <dialog open={shouldFallback}>
 *         <h2>Clipboard fallback</h2>
 *
 *         <ClipboardFallback
 *           mode={shouldFallback}
 *           onDismiss={() => setShouldFallback(null)}
 *           onReadText={handlePaste}
 *         />
 *       </dialog>
 *     </>
 *   )
 * ```
 */
export function useClipboard(): UseClipboardReturn {
  const [shouldFallback, setShouldFallback] = useState<ClipboardMode | null>(
    null,
  );

  const clipboardAPI = useMemo(
    () => ({
      async read() {
        try {
          return await read();
        } catch {
          setShouldFallback('read');
        }
      },
      async readText() {
        try {
          return await readText();
        } catch {
          setShouldFallback('readText');
        }
      },
      async write(data: ClipboardItems) {
        try {
          return await write(data);
        } catch {
          setShouldFallback('write');
        }
      },
      async writeText(data: string) {
        try {
          return await writeText(data);
        } catch {
          setShouldFallback('writeText');
        }
      },
    }),
    [],
  );

  return { ...clipboardAPI, shouldFallback, setShouldFallback };
}
