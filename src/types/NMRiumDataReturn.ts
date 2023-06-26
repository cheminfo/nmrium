import { CorrelationData } from 'nmr-correlation';
import { Workspace, ViewState, Spectrum } from 'nmr-load-save';

import { StateMolecule } from '../data/molecules/Molecule';

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
