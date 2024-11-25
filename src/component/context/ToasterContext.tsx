import type { ToastProps } from '@blueprintjs/core';
import { Classes, OverlayToaster, Position, Spinner } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useRef } from 'react';

interface ToasterContextProps {
  showLoading: (options: ToastProps) => () => void;
  showAsyncLoading: (options: ToastProps) => Promise<() => void>;
  show: (options: ToastProps) => void;
}

const ToasterContext = createContext<ToasterContextProps | null>(null);

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('Toaster context was not found');
  }

  return context;
}

interface ToasterProviderProps {
  children: ReactNode;
}

export function ToasterProvider({ children }: ToasterProviderProps) {
  const toasterRef = useRef<OverlayToaster>(null);

  const toasterApi = useMemo(() => {
    function show(options: ToastProps) {
      toasterRef.current?.show(options);
    }
    function showLoading(options: ToastProps) {
      const { message, ...otherProps } = options;

      const toastKey = toasterRef.current?.show({
        message: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Spinner size={25} />
            <span style={{ marginLeft: '0.5em' }}>{message}</span>
          </div>
        ),
        timeout: 0,
        ...otherProps,
      });

      function dismiss() {
        if (toastKey) {
          toasterRef.current?.dismiss(toastKey);
        }
      }

      return dismiss;
    }

    function showAsyncLoading(options: ToastProps) {
      return new Promise<() => void>((resolve) => {
        const hideLoading = showLoading(options);
        setTimeout(() => {
          resolve(hideLoading);
        }, 100);
      });
    }

    return { showLoading, showAsyncLoading, show };
  }, []);

  return (
    <>
      <OverlayToaster
        className={Classes.DARK}
        position={Position.BOTTOM}
        ref={toasterRef}
      />
      <ToasterContext.Provider value={toasterApi}>
        {children}
      </ToasterContext.Provider>
    </>
  );
}
