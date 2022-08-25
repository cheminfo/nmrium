import { CorrelationData } from 'nmr-correlation';

import { SpectraAnalysis } from '../data/data1d/MultipleAnalysis';
import { MoleculeObject } from '../data/molecules/Molecule';
import { Datum1D } from '../data/types/data1d';
import { Datum2D } from '../data/types/data2d';

import { Preferences } from './Preferences';

export interface NMRiumDataReturn {
  actionType?: string;
  version: number;
  spectra: (Datum1D | Datum2D)[];
  molecules: MoleculeObject[];
  correlations: CorrelationData;
  preferences: Preferences;
  multipleAnalysis: SpectraAnalysis;
}
