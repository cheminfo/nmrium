import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { usePreferences } from './PreferencesContext.js';

interface KeyModifiers {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

type ModifierName = keyof KeyModifiers;

const PRIMARY_MODIFIERS: ModifierName[] = ['shiftKey'];

type ModifiersKey = `shift[${boolean}]_ctrl[${boolean}]_alt[${boolean}]`;

interface KeyModifiersState extends KeyModifiers {
  modifiersKey: ModifiersKey | null;
  isPrimary: boolean;
}

const defaultKeyModifiersState: KeyModifiersState = {
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  modifiersKey: null,
  isPrimary: false,
};

const KeyModifierContext = createContext<KeyModifiersState>(
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

export type EventModifierKeys = Record<
  'shiftKey' | 'altKey' | 'metaKey' | 'ctrlKey',
  boolean
>;

export function getModifiers(eventKeys: EventModifierKeys): KeyModifiers {
  const { shiftKey, altKey, metaKey, ctrlKey } = eventKeys;
  return {
    ctrlKey: isMac ? metaKey : ctrlKey,
    shiftKey,
    altKey,
  };
}

function toModifiersKey(keyModifiers: KeyModifiers): ModifiersKey {
  const { shiftKey, altKey, ctrlKey } = keyModifiers;
  return `shift[${shiftKey ? 'true' : 'false'}]_ctrl[${ctrlKey ? 'true' : 'false'}]_alt[${altKey ? 'true' : 'false'}]`;
}

export function getModifiersKey(event: EventModifierKeys) {
  return toModifiersKey(getModifiers(event));
}

function isPrimaryActive(modifiers: KeyModifiers, invert: boolean): boolean {
  const allRequiredHeld = PRIMARY_MODIFIERS.every((mod) => modifiers[mod]);
  return invert ? !allRequiredHeld : allRequiredHeld;
}

export function useIsPrimaryKeyActivated() {
  const { isPrimary } = useKeyModifiers();
  return isPrimary;
}

export function useMapKeyModifiers() {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  return useCallback(
    (modifiers: KeyModifiers) => {
      return isPrimaryActive(modifiers, invert);
    },
    [invert],
  );
}

export function KeyModifiersProvider({ children }: KeyModifierProviderProps) {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();
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

  const state = useMemo(() => {
    return {
      ...modifiers,
      isPrimary: isPrimaryActive(modifiers, invert),
      modifiersKey: toModifiersKey(modifiers),
    };
  }, [invert, modifiers]);

  return (
    <KeyModifierContext.Provider value={state}>
      {children}
    </KeyModifierContext.Provider>
  );
}
