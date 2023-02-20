import { NmrLoaderSelectors, Spectrum2D } from 'nmr-load-save';

import { Filter } from '../../FiltersManager';

import { Data2D } from './Data2D';
import { Display2D } from './Display2D';
import { Info2D } from './Info2D';
import { Zones } from './Zones';

export interface Datum2D extends Spectrum2D {
  id: string;
  selector?: NmrLoaderSelectors;
  display: Display2D;
  info: Info2D;
  originalInfo?: Info2D;
  meta: any;
  metaInfo: any;
  data: Data2D;
  originalData?: Data2D;
  zones: Zones;
  filters: Array<Filter>;
}
