import { Filter } from '../../FiltersManager';
import { Source } from '../common/Source';

import { Data1D } from './Data1D';
import { Display1D } from './Display1D';
import { Info1D } from './Info1D';
import { Integrals } from './Integrals';
import { Peaks } from './Peaks';
import { Ranges } from './Ranges';

export interface Datum1D {
  id: string;
  source: Source;
  display: Display1D;
  info: Info1D;
  originalInfo?: Info1D;
  meta: any;
  data: Data1D;
  originalData?: Data1D;
  peaks: Peaks;
  integrals: Integrals;
  ranges: Ranges;
  filters: Array<Filter>;
}
