import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}
interface Controllers {
  dimmedSpectraTransparency: number;
}

export interface ColumnPreferences {
  show: boolean;
  format: string;
}

export interface IntegralsPanelPreferences {
  absolute: ColumnPreferences;
  relative: ColumnPreferences;
  color: string;
  strokeWidth: number;
}

export interface ZonesPanelPreferences {
  showFrom: boolean;
  fromFormat: string;
  showTo: boolean;
  toFormat: string;
  showAbsolute: boolean;
  absoluteFormat: string;
  showRelative: boolean;
  relativeFormat: string;
}

export interface RangesPanelPreferences {
  showFrom: boolean;
  fromFormat: string;
  showTo: boolean;
  toFormat: string;
  showAbsolute: boolean;
  absoluteFormat: string;
  showRelative: boolean;
  relativeFormat: string;
  showDeltaPPM: boolean;
  deltaPPMFormat: string;
  showDeltaHz: boolean;
  deltaHzFormat: string;
  jGraphTolerance: number;
  couplingFormat: string;
  showCoupling: boolean;
}

export interface PeaksPanelPreferences {
  peakNumber: ColumnPreferences;
  deltaPPM: ColumnPreferences;
  deltaHz: ColumnPreferences;
  peakWidth: ColumnPreferences;
  intensity: ColumnPreferences;
}

export interface DatabasePanelPreferences {
  showSmiles: boolean;
  showSolvent: boolean;
  showNames: boolean;
  showRange: boolean;
  showDelta: boolean;
  showAssignment: boolean;
  showCoupling: boolean;
  showMultiplicity: boolean;
}

export interface Panels {
  peaks?: Record<string, PeaksPanelPreferences>;
  integrals?: Record<string, IntegralsPanelPreferences>;
  ranges?: Record<string, RangesPanelPreferences>;
  zones?: Record<string, ZonesPanelPreferences>;
  database?: DatabasePanelPreferences;
}

export interface Formatting {
  nuclei: Record<string, NucleusFormat>;
  panels: Panels;
}

export interface Database {
  label: string;
  url: string;
  enabled: boolean;
}
export interface Workspace {
  version: number;
  label: string;
  display: NMRiumPreferences;
  controllers: Controllers;
  formatting: Formatting;
  databases: Database[];
}
