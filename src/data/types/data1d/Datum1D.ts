import { NmrLoaderSelectors } from 'nmr-load-save';

import { Filter } from '../../FiltersManager';

import { Data1D } from './Data1D';
import { Display1D } from './Display1D';
import { Info1D } from './Info1D';
import { Integrals } from './Integrals';
import { Peaks } from './Peaks';
import { Ranges } from './Ranges';

//TODO refactor all interfaces and use the ones from nmr-load-save
export interface Datum1D {
  id: string;
  selector?: NmrLoaderSelectors;
  display: Display1D;
  info: Info1D;
  originalInfo?: Info1D;
  meta: any;
  metaInfo: any;
  data: Data1D;
  originalData?: Data1D;
  peaks: Peaks;
  integrals: Integrals;
  ranges: Ranges;
  filters: Array<Filter>;
}
