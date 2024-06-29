import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { usePreferences } from './PreferencesContext';

type ModifiersKey = `shift[${boolean}]_ctrl[${boolean}]_alt[${boolean}]`;

type PrimaryKey =
  | 'shift[true]_ctrl[false]_alt[false]'
  | 'shift[false]_ctrl[false]_alt[false]';

function getPrimaryKey(invert: boolean): PrimaryKey {
  if (invert) {
    return 'shift[false]_ctrl[false]_alt[false]';
  }
  return 'shift[true]_ctrl[false]_alt[false]';
}

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

const isMac = globalThis.navigator?.userAgent?.toLowerCase().includes('mac');

export function getModifiers(event: KeyboardEvent | MouseEvent) {
  const { shiftKey, altKey, metaKey } = event;
  const ctrlKey = isMac ? metaKey : event.ctrlKey;
  return { ctrlKey, shiftKey, altKey };
}

export function toModifiersKey(keyModifiers: KeyModifiers): ModifiersKey {
  const { shiftKey, altKey, ctrlKey } = keyModifiers;
  return `shift[${shiftKey ? 'true' : 'false'}]_ctrl[${ctrlKey ? 'true' : 'false'}]_alt[${altKey ? 'true' : 'false'}]`;
}

function getModifiersKey(event: MouseEvent | KeyboardEvent) {
  const keyModifiers = getModifiers(event);
  return toModifiersKey(keyModifiers);
}

export function useMapKeyModifiers() {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  return useMemo(() => {
    const primaryKeyIdentifier = getPrimaryKey(invert);

    return {
      primaryKeyIdentifier,
      getModifiersKey,
    };
  }, [invert]);
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
      const modifiersKey = toModifiersKey(keyModifiers);
      setModifiers({ ...keyModifiers, modifiersKey });
    }

    function handleKeyUp(event: KeyboardEvent) {
      const keyModifiers = getModifiers(event);
      const modifiersKey = toModifiersKey(keyModifiers);
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
