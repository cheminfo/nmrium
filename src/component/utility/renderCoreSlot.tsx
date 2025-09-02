import type { NMRiumCore, SupportedUISlot } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';

/**
 * Render all components registered in the given slot.
 *
 * @param core
 * @param slot
 * @param fallback - return fallback if no component is registered in the slot
 */
export function renderCoreSlot(
  core: NMRiumCore,
  slot: SupportedUISlot,
  fallback?: ReactNode,
): ReactNode {
  const jsx = Array.from(core.slot(slot), ([key, Component]) => (
    <Component key={key} slot={slot} />
  ));

  return jsx.length > 0 ? jsx : fallback;
}
