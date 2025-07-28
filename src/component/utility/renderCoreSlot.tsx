import type { NMRiumCore, SupportedUISlot } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';

export function renderCoreSlot(
  core: NMRiumCore,
  slot: SupportedUISlot,
): ReactNode[] {
  return Array.from(core.slot(slot), ([key, Component]) => (
    <Component key={key} slot={slot} />
  ));
}
