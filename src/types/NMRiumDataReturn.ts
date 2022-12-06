import { CorrelationData } from 'nmr-correlation';

import { SpectraAnalysis } from '../data/data1d/MultipleAnalysis';
import { StateMolecule } from '../data/molecules/Molecule';
import { Datum1D } from '../data/types/data1d';
import { Datum2D } from '../data/types/data2d';

import { Preferences } from './Preferences';

export interface NMRiumDataReturn {
  version: number;
  data: {
    actionType?: string;
    spectra: (Datum1D | Datum2D)[];
    molecules: StateMolecule[];
    correlations: CorrelationData;
    preferences: Preferences;
    multipleAnalysis: SpectraAnalysis;
  };
}
