import { KeyboardEvent, MouseEvent } from 'react';

export default function checkModifierKeyActivated(
  event: KeyboardEvent | MouseEvent,
): boolean {
  const modifiersKeys = [
    'Alt',
    'AltGraph',
    'CapsLock',
    'Control',
    'Meta',
    'NumLocK',
    'ScrollLock',
    'Shift',
    'OS',
  ];
  for (const key of modifiersKeys) {
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}
