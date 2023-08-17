import { WebSource } from 'filelist-utils';
import { CorrelationData } from 'nmr-correlation';
import type {
  NmriumState as NMRiumState,
  WorkspacePreferences as NMRiumPreferences,
  Spectrum,
} from 'nmr-load-save';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

interface NMRiumData {
  source?: WebSource;
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

type NMRiumChangeCb = (
  state: NMRiumState,
  source: 'data' | 'view' | 'settings',
) => void;

type NMRiumMolecules = Array<{ molfile: string }>;

/* eslint-disable unicorn/prefer-export-from */
export type {
  NMRiumChangeCb,
  NMRiumData,
  NMRiumMolecules,
  NMRiumPreferences,
  NMRiumState,
  NMRiumWorkspace,
};
/* eslint-enable unicorn/prefer-export-from */
