import { FifoLoggerOptions } from 'fifo-logger';
import { BrukerLoaderSelector, GeneralLoadersSelector } from 'nmr-load-save';
import { SplitPaneSize } from 'react-science/ui';

import { BaseFilter } from '../../data/FiltersManager';
import { AnalysisOptions } from '../../data/data1d/multipleSpectraAnalysis';
import { Nuclei, Nucleus } from '../../data/types/common/Nucleus';
import { MatrixOptions } from '../../data/types/data1d/MatrixOptions';
import { NMRiumGeneralPreferences } from '../../types/NMRiumGeneralPreferences';
import { NMRiumPanelPreferences } from '../../types/NMRiumPanelPreferences';
import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}

export type spectraRendering =
  | 'auto'
  | 'optimizeSpeed'
  | 'crispEdges'
  | 'geometricPrecision';
export interface GeneralPreferences {
  dimmedSpectraOpacity: number;
  verticalSplitterPosition: SplitPaneSize;
  verticalSplitterCloseThreshold: number;
  spectraRendering: spectraRendering;
  loggingLevel: FifoLoggerOptions['level'];
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
}

export type PredefinedSpectraColumn = 'visible' | 'name' | 'color' | 'solvent';
export interface PredefinedTableColumn<T> extends BasicColumnPreferences {
  name: T;
  description: string;
  jpath?: string[];
}

export interface JpathTableColumn extends BasicColumnPreferences {
  jpath: string[];
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

type PredefinedLegend = 'intensity' | 'name';

export type JpathLegendField = Omit<JpathTableColumn, 'label'>;
export type PredefinedLegendField = Omit<
  PredefinedTableColumn<PredefinedLegend>,
  'description'
>;

export type legendField = JpathLegendField | PredefinedLegendField;

export interface AnalysisPreferences extends AnalysisOptions {
  resortSpectra: boolean;
}
export interface MultipleSpectraAnalysisPreferences {
  analysisOptions: AnalysisPreferences;
  legendsFields: legendField[];
}

export type MultipleSpectraAnalysis =
  | Record<Nuclei, MultipleSpectraAnalysisPreferences>
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type MatrixGeneration = Record<Nuclei, MatrixOptions> | {};

export interface WorkSpacePanelPreferences {
  spectra: SpectraNucleusPreferences;
  peaks: PeaksNucleusPreferences;
  integrals: IntegralsNucleusPreferences;
  ranges: RangesNucleusPreferences;
  zones: ZonesNucleusPreferences & ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
  multipleSpectraAnalysis: MultipleSpectraAnalysis;
  matrixGeneration: MatrixGeneration;
}

export interface PanelsPreferences {
  spectra: NucleusPreferences<SpectraNucleusPreferences>;
  peaks: NucleusPreferences<PeaksNucleusPreferences>;
  integrals: NucleusPreferences<IntegralsNucleusPreferences>;
  ranges: NucleusPreferences<RangesNucleusPreferences>;
  zones: NucleusPreferences<ZonesNucleusPreferences> &
    ZonesGeneralPanelPreferences;
  database: DatabasePanelPreferences;
  multipleSpectraAnalysis: MultipleSpectraAnalysis;
  matrixGeneration: MatrixGeneration;
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
  /**
   * boolean indicator to hide/show Workspace
   * @default false
   */
  visible?: boolean;
}

export interface Databases {
  data: Database[];
  defaultDatabase: string;
}

export interface LoadersPreferences {
  general: GeneralLoadersSelector;
  bruker: BrukerLoaderSelector;
}

export interface InfoBlock {
  visible: boolean;
  fields: JpathTableColumn[];
}

export type OnLoadProcessing = Partial<Record<Nucleus, BaseFilter[]>>;

export interface DisplayPreferences {
  general?: Partial<NMRiumGeneralPreferences>;
  panels?: Partial<NMRiumPanelPreferences>;
  toolBarButtons?: Partial<NMRiumToolBarPreferences>;
}
export interface WorkspacePreferences {
  display?: DisplayPreferences;
  general?: GeneralPreferences;
  formatting?: Formatting;
  databases?: Databases;
  nmrLoaders?: LoadersPreferences;
  infoBlock?: InfoBlock;
  onLoadProcessing?: OnLoadProcessing;
}

/**
 * custom : workspace which come form the component level <NMRium customWorkspaces = {} />
 * predefined : workspace which hardcoded in NMRium
 * user: workspaces which the user create from the general settings
 * component: workspaces which specified at the level of the component `preferences` property
 * nmriumFile: workspaces which is come from the the numrium file
 *
 * */
export type WorkSpaceSource =
  | 'custom'
  | 'predefined'
  | 'user'
  | 'component'
  | 'nmriumFile';

export type InnerWorkspace = WorkspaceMeta & WorkspacePreferences;
export type CustomWorkspaces = Record<string, InnerWorkspace>;

export type Workspace = WorkspaceMeta & Required<WorkspacePreferences>;
