import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface KeyModifiers {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

const defaultKeyModifiersState: KeyModifiers = {
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};

export const KeyModifierContext = createContext<KeyModifiers>(
  defaultKeyModifiersState,
);

export function useKeyModifiers() {
  const context = useContext(KeyModifierContext);
  if (!context) {
    throw new Error('key modifiers context was not found');
  }

  return context;
}

interface KeyModifierProviderProps {
  children: ReactNode;
}

const isMac =
  navigator !== undefined && navigator.userAgent.toLowerCase().includes('mac');

export function getModifiers(event: KeyboardEvent | MouseEvent) {
  const { shiftKey, altKey, metaKey } = event;
  const ctrlKey = isMac ? metaKey : event.ctrlKey;
  return { ctrlKey, shiftKey, altKey };
}

export function KeyModifiersProvider({ children }: KeyModifierProviderProps) {
  const [modifiers, setModifiers] = useState<KeyModifiers>(
    defaultKeyModifiersState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      setModifiers(getModifiers(event));
    }

    function handleKeyUp(event: KeyboardEvent) {
      setModifiers(getModifiers(event));
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <KeyModifierContext.Provider value={modifiers}>
      {children}
    </KeyModifierContext.Provider>
  );
}
