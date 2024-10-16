import type { CorrelationData } from 'nmr-correlation';
import type { Spectrum, ViewState, Workspace } from 'nmr-load-save';

import type { StateMolecule } from '../data/molecules/Molecule.js';

export interface NMRiumDataReturn {
  version: number;
  data?: {
    actionType?: string;
    spectra: Spectrum[];
    molecules: StateMolecule[];
    correlations?: CorrelationData;
  };
  view?: ViewState;
  settings?: Workspace;
}
