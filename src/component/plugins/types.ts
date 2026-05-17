import type { ComponentType } from 'react';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';

export interface MoleculesPanelOverlayProps {
  molecule: StateMoleculeExtended;
  moleculeIndex: number;
  width: number;
  height: number;
}

export interface MoleculesPanelHeaderProps {
  molecule: StateMoleculeExtended;
  moleculeIndex: number;
}

export interface NMRiumPluginSlots {
  /**
   * Rendered inside the molecule viewer container with absolute positioning,
   * allowing the plugin to overlay or replace the 2D structure viewer.
   * The component receives the current molecule and container dimensions.
   */
  'molecules.panel.overlay'?: ComponentType<MoleculesPanelOverlayProps>;
  /**
   * Rendered as a toolbar item inside the Molecules panel header toolbar,
   * between the float-molecule button and the "More" menu.
   * The component receives the current molecule.
   */
  'molecules.panel.header'?: ComponentType<MoleculesPanelHeaderProps>;
}

export interface NMRiumPlugin {
  /** Namespaced unique identifier, e.g. '@zakodium/nmrium-3d-viewer' */
  id: string;
  slots?: Partial<NMRiumPluginSlots>;
}
