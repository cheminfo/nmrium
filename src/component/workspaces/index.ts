import { assignment } from './assignment';
import { basic } from './basic';
import { embedded } from './embedded';
import { exercise } from './exercise';
import { prediction } from './prediction';
import { process1D } from './process1D';
import { simulation } from './simulation';

export default {
  exercise,
  default: basic,
  process1D,
  prediction,
  assignment,
  embedded,
  simulation,
};
