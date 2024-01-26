import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { usePreferences } from './PreferencesContext';

type ModifiersKey =
  `invert[${boolean}]_shift[${boolean}]_ctrl[${boolean}]_alt[${boolean}]`;

interface KeyModifiers {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}
interface KeyModifiersState extends KeyModifiers {
  modifiersKey: ModifiersKey | null;
}

const defaultKeyModifiersState: KeyModifiersState = {
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  modifiersKey: null,
};

export const KeyModifierContext = createContext<KeyModifiersState>(
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

export function toModifiersKey(
  keyModifiers: KeyModifiers,
  invert: boolean,
): ModifiersKey {
  const { shiftKey, altKey, ctrlKey } = keyModifiers;
  return `invert[${invert}]_shift[${shiftKey ? 'true' : 'false'}]_ctrl[${ctrlKey ? 'true' : 'false'}]_alt[${altKey ? 'true' : 'false'}]`;
}

export function useMapKeyModifiers() {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  return useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      const keyModifiers = getModifiers(event);
      return toModifiersKey(keyModifiers, invert);
    },
    [invert],
  );
}

export function KeyModifiersProvider({ children }: KeyModifierProviderProps) {
  const [modifiers, setModifiers] = useState<KeyModifiersState>(
    defaultKeyModifiersState,
  );
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const keyModifiers = getModifiers(event);
      const modifiersKey = toModifiersKey(keyModifiers, invert);
      setModifiers({ ...keyModifiers, modifiersKey });
    }

    function handleKeyUp(event: KeyboardEvent) {
      const keyModifiers = getModifiers(event);
      const modifiersKey = toModifiersKey(keyModifiers, invert);
      setModifiers({ ...keyModifiers, modifiersKey });
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [invert]);

  return (
    <KeyModifierContext.Provider value={modifiers}>
      {children}
    </KeyModifierContext.Provider>
  );
}
