import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  newClipboardItem,
  read,
  readText,
  write,
  writeText,
} from './clipboard';
import { ClipboardMode } from './types';

type PN = PermissionName | 'clipboard-read' | 'clipboard-write';

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

export interface UseClipboardReturn {
  /**
   * polyfill native api (stable)
   */
  /**
   * Fallback on 'read' mode
   */
  read: () => Promise<ClipboardItems | undefined>;
  /**
   * Fallback on 'readText' mode
   */
  readText: () => Promise<string | undefined>;
  /**
   * Fallback on 'write' mode with blobs (get blob for each first type for each item) state
   */
  write: (data: ClipboardItems) => Promise<void>;
  /**
   * Fallback on 'writeText' mode with text state
   */
  writeText: (data: string) => Promise<void>;

  /**
   * custom helper (stable)
   */
  /**
   * use write but no need do to manually ClipboardItems transform
   * Fallback on 'writeText' mode with text state
   * @param data
   * @param type a mime type default to 'text/plain'
   */
  rawWriteWithType: (
    data: string,
    type?: 'text/html' | 'text/plain' | string,
  ) => Promise<void>;

  /**
   * state for alternative
   */
  /**
   * state to know if you need to display an alternative interface
   */
  shouldFallback: ClipboardMode | undefined;
  /**
   * state for 'writeText' / 'rawWriteWithType' mode fallback
   */
  text: string | undefined;
  /**
   * state for 'write' mode fallback
   */
  blobs: Blob[] | undefined;

  /**
   * method to clean up state for alternative interface (set shouldFallback to undefined, text to undefined and blobs to undefined)
   * stable
   */
  cleanShouldFallback: () => void;
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
 *     // yes you can safely ignore error here,
 *     // readText() will never throw, error is caught and set shouldFallback to corresponding mode
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
 *       <ClipboardFallbackModal
 *         mode={shouldFallback}
 *         onDismiss={() => setShouldFallback(null)}
 *         onReadText={handlePaste}
 *       />
 *     </>
 *   )
 * ```
 */
export function useClipboard(): UseClipboardReturn {
  const [shouldFallback, setShouldFallback] = useState<
    ClipboardMode | undefined
  >();
  const [text, setText] = useState<string | undefined>();
  const [blobs, setBlobs] = useState<Blob[] | undefined>();
  const cleanShouldFallback = useCallback(() => {
    setShouldFallback(undefined);
    setText(undefined);
    setBlobs(undefined);
  }, []);

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
          const blobs = await Promise.all(
            data.map((ci) => ci.getType(ci.types[0])),
          );
          setBlobs(blobs);
          setShouldFallback('write');
        }
      },
      async rawWriteWithType(data: string, type = 'text/plain') {
        try {
          const item = await newClipboardItem({
            [type]: new Blob([data], { type }),
          });
          return await write([item]);
        } catch {
          setText(data);
          setShouldFallback('writeText');
        }
      },
      async writeText(data: string) {
        try {
          return await writeText(data);
        } catch {
          setText(data);
          setShouldFallback('writeText');
        }
      },
    }),
    [],
  );

  return {
    ...clipboardAPI,
    shouldFallback,
    text,
    blobs,
    cleanShouldFallback,
  };
}
