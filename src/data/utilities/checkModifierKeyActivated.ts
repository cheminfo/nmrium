import { KeyboardEvent, ModifierKey, MouseEvent } from 'react';

export default function checkModifierKeyActivated(
  event: KeyboardEvent | MouseEvent,
): boolean {
  const modifiersKeys: ModifierKey[] = [
    'Alt',
    'AltGraph',
    'Control',
    'Meta',
    'Shift',
  ];
  for (const key of modifiersKeys) {
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}
