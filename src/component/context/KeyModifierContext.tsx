import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { usePreferences } from './PreferencesContext.js';

type ModifiersKey = `shift[${boolean}]_ctrl[${boolean}]_alt[${boolean}]`;

type PrimaryKey =
  'shift[true]_ctrl[false]_alt[false]' | 'shift[false]_ctrl[false]_alt[false]';

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

export function getModifiers(eventKeys: EventModifierKeys) {
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

function getModifiersKey(event: EventModifierKeys) {
  const keyModifiers = getModifiers(event);
  return toModifiersKey(keyModifiers);
}

export function useIsPrimaryKeyActivated() {
  const { primaryKeyIdentifier } = useMapKeyModifiers();
  return primaryKeyIdentifier === 'shift[false]_ctrl[false]_alt[false]';
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

function isPrimaryActive(shiftKey: boolean, invert: boolean): boolean {
  const primaryKey = getPrimaryKey(invert);
  const shiftOnlyKey = toModifiersKey({
    shiftKey,
    ctrlKey: false,
    altKey: false,
  });
  return shiftOnlyKey === primaryKey;
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
      const keyModifiers = getModifiers(event);
      setModifiers(keyModifiers);
    }

    function handleKeyUp(event: KeyboardEvent) {
      const keyModifiers = getModifiers(event);
      setModifiers(keyModifiers);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [invert]);

  const state = useMemo(() => {
    const modifiersKey = toModifiersKey(modifiers);
    return {
      ...modifiers,
      isPrimary: isPrimaryActive(modifiers.shiftKey, invert),
      modifiersKey,
    };
  }, [invert, modifiers]);

  return (
    <KeyModifierContext.Provider value={state}>
      {children}
    </KeyModifierContext.Provider>
  );
}
