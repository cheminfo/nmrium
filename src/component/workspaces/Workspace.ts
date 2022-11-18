import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}
interface GeneralPreferences {
  dimmedSpectraOpacity: number;
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

interface BasicColumnPreferences {
  visible: boolean;
  label: string;
  index: number;
}

export type PredefinedSpectraColumn =
  | 'visible'
  | 'name'
  | 'peaks-visible'
  | 'color'
  | 'solvent';
export interface PredefinedTableColumn<T> extends BasicColumnPreferences {
  name: T;
}

export interface JpathTableColumn extends BasicColumnPreferences {
  jpath: string;
}

export type SpectraTableColumn =
  | PredefinedTableColumn<PredefinedSpectraColumn>
  | JpathTableColumn;

export interface SpectraNucleusPreferences {
  columns: Array<SpectraTableColumn>;
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

export interface PeaksNucleusPreferences {
  peakNumber: ColumnPreferences;
  deltaPPM: ColumnPreferences;
  deltaHz: ColumnPreferences;
  peakWidth: ColumnPreferences;
  intensity: ColumnPreferences;
  showKind: boolean;
  fwhm: ColumnPreferences;
  mu: ColumnPreferences;
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

export interface MultipleSpectraAnalysisPreferences {
  resortSpectra: boolean;
}

export interface WorkSpacePanelPreferences {
  spectra: SpectraNucleusPreferences;
  peaks: PeaksNucleusPreferences;
  integrals: IntegralsNucleusPreferences;
  ranges: RangesNucleusPreferences;
  zones: ZonesNucleusPreferences & ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
  multipleSpectraAnalysis: MultipleSpectraAnalysisPreferences;
}

export interface PanelsPreferences {
  spectra: NucleusPreferences<SpectraNucleusPreferences>;
  peaks: NucleusPreferences<PeaksNucleusPreferences>;
  integrals: NucleusPreferences<IntegralsNucleusPreferences>;
  ranges: NucleusPreferences<RangesNucleusPreferences>;
  zones: NucleusPreferences<ZonesNucleusPreferences> &
    ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
  multipleSpectraAnalysis: MultipleSpectraAnalysisPreferences;
}

export interface Formatting {
  nuclei: Record<string, NucleusFormat>;
  panels: Partial<PanelsPreferences>;
}

export interface Database {
  key: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface WorkspaceMeta {
  version: number;
  label: string;
}
export interface Databases {
  data: Database[];
  defaultDatabase: string;
}

export interface WorkspaceData {
  display?: NMRiumPreferences;
  general?: GeneralPreferences;
  formatting?: Formatting;
  databases?: Databases;
}

export type InnerWorkspace = WorkspaceMeta & WorkspaceData;

export type Workspace = WorkspaceMeta & Required<WorkspaceData>;
