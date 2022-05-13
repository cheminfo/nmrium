import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}
interface Controllers {
  dimmedSpectraTransparency: number;
}

export interface IntegralsPanelPreferences {
  showAbsolute: boolean;
  absoluteFormat: string;
  showRelative: boolean;
  relativeFormat: string;
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
}

export interface PeaksPanelPreferences {
  showPeakNumber: boolean;
  peakNumberFormat: string;
  showPeakIndex: boolean;
  peakIndexFormat: string;
  showDeltaPPM: boolean;
  deltaPPMFormat: string;
  showDeltaHz: boolean;
  deltaHzFormat: string;
  showPeakWidth: boolean;
  peakWidthFormat: string;
  showIntensity: boolean;
  intensityFormat: string;
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

interface Panels {
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
