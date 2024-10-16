import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface PrepareExportContextState {
  registerComponent: (componentId) => void;
  unRegisterComponent: (componentId) => void;
  notifyComponentLoaded: (componentId) => void;
  prepareExportStart: () => void;
  waitForAllComponentsRendered: () => Promise<void>;
  prepareExportEnd: () => void;
  isExporting: boolean;
}

interface PrepareExportProviderProps {
  children: ReactNode;
  timeout?: number;
}

const PrepareExportContext = createContext<PrepareExportContextState | null>(
  null,
);

export function usePrepareExport(): PrepareExportContextState {
  const context = useContext(PrepareExportContext);

  if (!context) {
    throw new Error('Export prepare context was not found');
  }
  return context;
}

export function useRegisterExportComponents(componentId: string) {
  const { registerComponent, unRegisterComponent } = usePrepareExport();

  useEffect(() => {
    registerComponent(componentId);

    return () => {
      unRegisterComponent(componentId);
    };
  }, [componentId, registerComponent, unRegisterComponent]);
}
export function useNotifyComponentLoaded(componentId: string) {
  const { notifyComponentLoaded } = usePrepareExport();

  useEffect(() => {
    notifyComponentLoaded(componentId);
  }, [componentId, notifyComponentLoaded]);
}

export function PrepareExportProvider(props: PrepareExportProviderProps) {
  const { children, timeout = 10000 } = props;
  const [isExporting, setIsExporting] = useState(false);
  const componentRefs = useRef<Map<string, boolean>>(new Map());

  const registerComponent = useCallback((componentId) => {
    componentRefs.current.set(componentId, false);
  }, []);
  const unRegisterComponent = useCallback((componentId) => {
    componentRefs.current.delete(componentId);
  }, []);

  const notifyComponentLoaded = useCallback((componentId) => {
    componentRefs.current.set(componentId, true);
  }, []);

  const prepareExportStart = useCallback(() => {
    setIsExporting(true);
  }, []);

  const prepareExportEnd = useCallback(() => {
    for (const key of componentRefs.current.keys()) {
      componentRefs.current.set(key, false);
    }

    setIsExporting(false);
  }, []);

  const waitForAllComponentsRendered = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const loadPromise = checkComponents(componentRefs.current);
      const timeoutPromise = createTimeoutPromise(timeout);

      Promise.race([loadPromise, timeoutPromise])
        .then(resolve)
        .catch((error: unknown) => {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error('Unknown error occurred'));
          }
        });
    });
  }, [timeout]);

  const state = useMemo(() => {
    return {
      prepareExportStart,
      prepareExportEnd,
      registerComponent,
      notifyComponentLoaded,
      waitForAllComponentsRendered,
      unRegisterComponent,
      isExporting,
    };
  }, [
    prepareExportStart,
    prepareExportEnd,
    registerComponent,
    notifyComponentLoaded,
    waitForAllComponentsRendered,
    unRegisterComponent,
    isExporting,
  ]);

  return (
    <PrepareExportContext.Provider value={state}>
      {children}
    </PrepareExportContext.Provider>
  );
}

const interval = 100;

function checkComponents(componentsStatus: Map<string, boolean>) {
  if (componentsStatus.size === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      const allLoaded = Array.from(componentsStatus.values()).every(Boolean);

      if (allLoaded) {
        clearInterval(checkInterval);
        resolve();
      }
    }, interval);
  });
}

function createTimeoutPromise(timeout: number) {
  return new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Load svg component timeout'));
    }, timeout);
  });
}

export function withExportRegister<P extends object>(
  Component: React.ComponentType<P>,
  componentId: string,
) {
  return (props: P) => {
    const { isExporting } = usePrepareExport();

    useRegisterExportComponents(componentId);

    if (isExporting) return null;

    return <Component {...props} />;
  };
}
export function withExport<P extends object>(
  Component: React.ComponentType<P>,
  componentId: string,
) {
  return (props: P) => {
    const { isExporting } = usePrepareExport();

    useNotifyComponentLoaded(componentId);

    if (!isExporting) {
      return null;
    }

    return <Component {...props} />;
  };
}
