import { useCallback, useEffect, useState } from 'react';

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

interface UsePermissionReturn {
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

  if (state === 'granted') {
    return { state, isGranted: true };
  }

  return { state, isGranted: false };
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

export function useClipboardRead<Mode extends 'read' | 'readText' = 'readText'>(
  now: boolean,
  mode: Mode,
  onRead: Mode extends 'read'
    ? (data: ClipboardItems) => void
    : (data: string) => void,
  onReadError: (error) => void = reportError,
): UsePermissionReturn {
  const proxyCallback = useCallback(() => {
    const promise = mode === 'read' ? read() : readText();

    // @ts-expect-error cannot find proper way to express callback typing compatible with promise
    promise.then(onRead).catch(onReadError);
  }, [mode, onRead, onReadError]);

  return useNavigatorPermission(now, 'clipboard-read', proxyCallback);
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

export function useClipboardWrite<
  Mode extends 'write' | 'writeText' = 'writeText',
>(
  now: boolean,
  mode: Mode,
  data: Mode extends 'write' ? ClipboardItems : string,
  onWriteError: (error) => void = reportError,
): UsePermissionReturn {
  const proxyCallback = useCallback(() => {
    const promise =
      mode === 'write'
        ? write(data as ClipboardItems)
        : writeText(data as string);

    promise.catch(onWriteError);
  }, [mode, data, onWriteError]);

  return useNavigatorPermission(now, 'clipboard-write', proxyCallback);
}
