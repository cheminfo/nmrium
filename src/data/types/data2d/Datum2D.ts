import { Filter } from '../../FiltersManager';
import { Source } from '../common/Source';

import { Data2D } from './Data2D';
import { Display2D } from './Display2D';
import { Info2D } from './Info2D';
import { Zones } from './Zones';

export interface Datum2D {
  id: string;
  source: Source;
  display: Display2D;
  info: Info2D;
  originalInfo?: Info2D;
  meta: any;
  data: Data2D;
  originalData?: Data2D;
  zones: Zones;
  filters: Array<Filter>;
}
