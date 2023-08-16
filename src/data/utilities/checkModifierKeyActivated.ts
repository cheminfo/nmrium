import { KeyboardEvent, ModifierKey, MouseEvent } from 'react';

const modifiersKeys: ModifierKey[] = [
  'Alt',
  'AltGraph',
  'Control',
  'Meta',
  'Shift',
];

export default function checkModifierKeyActivated<E = HTMLDivElement>(
  event: KeyboardEvent<E> | MouseEvent<E>,
): boolean {
  return modifiersKeys.some((key) => event.getModifierState(key));
}
