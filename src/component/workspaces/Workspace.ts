import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}
interface Controllers {
  dimmedSpectraTransparency: number;
}

interface ColumnPreferences {
  show: boolean;
  format: string;
}

interface IntegralsNucleusPreferences {
  absolute: ColumnPreferences;
  relative: ColumnPreferences;
  color: string;
  strokeWidth: number;
}

interface ZonesNucleusPreferences {
  deltaPPM: ColumnPreferences;
}
interface ZonesGeneralPanelPreferences {
  absolute: ColumnPreferences;
  relative: ColumnPreferences;
}

interface NucleusPreferences<T> {
  nuclei: Record<string, T>;
}

interface RangesNucleusPreferences {
  from: ColumnPreferences;
  to: ColumnPreferences;
  absolute: ColumnPreferences;
  relative: ColumnPreferences;
  deltaPPM: ColumnPreferences;
  deltaHz: ColumnPreferences;
  coupling: ColumnPreferences;
  jGraphTolerance: number;
  showKind: boolean;
}

interface PeaksNucleusPreferences {
  peakNumber: ColumnPreferences;
  deltaPPM: ColumnPreferences;
  deltaHz: ColumnPreferences;
  peakWidth: ColumnPreferences;
  intensity: ColumnPreferences;
}

export interface DatabasePanelPreferences {
  previewJcamp: boolean;
  showSmiles: boolean;
  showSolvent: boolean;
  showNames: boolean;
  range: ColumnPreferences;
  delta: ColumnPreferences;
  showAssignment: boolean;
  coupling: ColumnPreferences;
  showMultiplicity: boolean;
  color: string;
  marginBottom: number;
}

export interface WorkSpacePanelPreferences {
  peaks: PeaksNucleusPreferences;
  integrals: IntegralsNucleusPreferences;
  ranges: RangesNucleusPreferences;
  zones: ZonesNucleusPreferences & ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
}

export interface PanelsPreferences {
  peaks: NucleusPreferences<PeaksNucleusPreferences>;
  integrals: NucleusPreferences<IntegralsNucleusPreferences>;
  ranges: NucleusPreferences<RangesNucleusPreferences>;
  zones: NucleusPreferences<ZonesNucleusPreferences> &
    ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
}

export interface Formatting {
  nuclei: Record<string, NucleusFormat>;
  panels: Partial<PanelsPreferences>;
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
