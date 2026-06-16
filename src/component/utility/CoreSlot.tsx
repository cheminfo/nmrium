import type {
  NMRiumCore,
  PluginUIComponentProps,
  SupportedUISlot,
} from '@zakodium/nmrium-core';
import { castSlotProps } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';

type SlotProps<Slot extends SupportedUISlot> =
  Omit<Extract<PluginUIComponentProps, { slot: Slot }>, 'slot'> extends Record<
    string,
    never
  >
    ? object
    : Omit<Extract<PluginUIComponentProps, { slot: Slot }>, 'slot'>;

interface CoreSlotProps<Slot extends SupportedUISlot> {
  slot: Slot;
  core: NMRiumCore;
  fallback?: ReactNode;
}

/**
 * Render all components registered in the given slot.
 */
export function CoreSlot<Slot extends SupportedUISlot>(
  props: CoreSlotProps<Slot> & SlotProps<Slot>,
) {
  const { slot, core, fallback, ...slotProps } = props;
  castSlotProps(slotProps, slot);

  const jsx = Array.from(core.slot(slot), ([key, Component]) => (
    <Component key={key} {...slotProps} slot={slot} />
  ));

  return jsx.length > 0 ? jsx : fallback;
}
