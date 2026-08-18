import type {
  CustomWorkspaces,
  NmriumState as NMRiumState,
  Spectrum,
  WorkspacePreferences as NMRiumPreferences,
} from '@zakodium/nmrium-core';
import type { Source } from 'file-collection';
import type { CorrelationData } from 'nmr-correlation';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

interface NMRiumData {
  source?: Source;
  molecules?: NMRiumMolecules;
  spectra: Array<DeepPartial<Spectrum>>;
  correlations?: CorrelationData;
}

type NMRiumWorkspace =
  | 'exercise'
  | 'process1D'
  | 'default'
  | 'prediction'
  | 'embedded'
  | 'assignment'
  | 'simulation'
  | (string & {});

interface VersionedCustomWorkspaces {
  /**
   * Version the workspaces were created with, they are migrated to the current one.
   */
  version: number;
  workspaces: CustomWorkspaces;
}

/**
 * Workspaces defined at the component level, either already in the current
 * version or tagged with the version they were created with.
 */
type NMRiumCustomWorkspaces = CustomWorkspaces | VersionedCustomWorkspaces;

type NMRiumChangeCb = (
  state: NMRiumState,
  source: 'data' | 'view' | 'settings',
) => void;

type NMRiumMolecules = Array<{ molfile: string }>;

/* eslint-disable unicorn/prefer-export-from */
export type {
  NMRiumChangeCb,
  NMRiumCustomWorkspaces,
  NMRiumData,
  NMRiumMolecules,
  NMRiumPreferences,
  NMRiumState,
  NMRiumWorkspace,
  VersionedCustomWorkspaces,
};
/* eslint-enable unicorn/prefer-export-from */
