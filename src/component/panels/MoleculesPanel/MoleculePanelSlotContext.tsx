import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';

export interface MoleculePanelSlotData {
  /** The molecule this slot instance is rendered for. */
  molecule: StateMoleculeExtended;
  /** Index of the molecule in the molecules panel. */
  moleculeIndex: number;
  /** Available width of the molecule container. Only meaningful for the overlay slot. */
  width: number;
  /** Available height of the molecule container. Only meaningful for the overlay slot. */
  height: number;
}

const MoleculePanelSlotContext = createContext<MoleculePanelSlotData | null>(
  null,
);

interface MoleculePanelSlotProviderProps {
  molecule: StateMoleculeExtended;
  moleculeIndex: number;
  width?: number;
  height?: number;
  children: ReactNode;
}

export function MoleculePanelSlotProvider(
  props: MoleculePanelSlotProviderProps,
) {
  const { molecule, moleculeIndex, width = 0, height = 0, children } = props;
  const value = useMemo<MoleculePanelSlotData>(
    () => ({ molecule, moleculeIndex, width, height }),
    [molecule, moleculeIndex, width, height],
  );
  return (
    <MoleculePanelSlotContext.Provider value={value}>
      {children}
    </MoleculePanelSlotContext.Provider>
  );
}

/**
 * Access the molecule data for the currently-rendered `molecules_panel.*` UI
 * slot. Must be used inside a molecules panel slot component registered through
 * the core plugin `ui` registry.
 */
export function useMoleculePanelSlot(): MoleculePanelSlotData {
  const context = useContext(MoleculePanelSlotContext);
  if (!context) {
    throw new Error(
      'useMoleculePanelSlot must be used within a molecules panel slot',
    );
  }
  return context;
}
