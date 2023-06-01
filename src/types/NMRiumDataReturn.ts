import { CorrelationData } from 'nmr-correlation';
import { Workspace, ViewState } from 'nmr-load-save';
import { Spectrum } from 'nmr-processing';

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
