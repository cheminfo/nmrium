import {
  Classes,
  OverlayToaster,
  Position,
  Spinner,
  ToastProps,
} from '@blueprintjs/core';
import { ReactNode, createContext, useContext, useMemo, useRef } from 'react';

interface ToasterContextProps {
  toaster: OverlayToaster | null;
  showLoading: (options: ToastProps) => () => void;
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

  const toaster = useMemo(() => {
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

      return () => {
        if (toastKey) {
          toasterRef.current?.dismiss(toastKey);
        }
      };
    }

    return { toaster: toasterRef.current, showLoading, show };
  }, []);

  return (
    <>
      <OverlayToaster
        className={Classes.DARK}
        position={Position.BOTTOM}
        ref={toasterRef}
      />
      <ToasterContext.Provider value={toaster}>
        {children}
      </ToasterContext.Provider>
    </>
  );
}
