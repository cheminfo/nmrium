import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
  useState,
} from 'react';

export interface SwitchContext {
  isFlipped: boolean;
  open: (event?) => void;
  close: (event?, extra?: any) => void;
}

export const SwitchContainerContext = createContext<SwitchContext | null>(null);

export function useSwitchContext(): SwitchContext {
  const context = useContext(SwitchContainerContext);
  if (!context) {
    throw new Error('Switch context was not found');
  }
  return context;
}

export function SwitchContainerProvider(props: { children: ReactNode }) {
  const [isFlipped, setFlipped] = useState<boolean>(false);

  const openHandler = useCallback(() => {
    setFlipped(true);
  }, [setFlipped]);

  const closeHandler = useCallback(() => {
    setFlipped(false);
  }, [setFlipped]);

  const state = useMemo(
    () => ({
      isFlipped,
      open: openHandler,
      close: closeHandler,
    }),
    [closeHandler, isFlipped, openHandler],
  );

  return (
    <SwitchContainerContext.Provider value={state}>
      {props.children}
    </SwitchContainerContext.Provider>
  );
}
