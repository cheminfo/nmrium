import { CorrelationData } from 'nmr-correlation';
import { Spectrum } from 'nmr-load-save';

import { ViewState } from '../component/reducer/Reducer';
import { Workspace } from '../component/workspaces/Workspace';
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
