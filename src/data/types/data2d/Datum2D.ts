import { NmrLoaderSelectors } from 'nmr-load-save';

import { Filter } from '../../FiltersManager';

import { Data2D } from './Data2D';
import { Display2D } from './Display2D';
import { Info2D } from './Info2D';
import { Zones } from './Zones';

//TODO refactor all interfaces and use the ones from nmr-load-save
export interface Datum2D {
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
