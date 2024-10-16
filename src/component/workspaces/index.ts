import { assignment } from './assignment.js';
import { basic } from './basic.js';
import { embedded } from './embedded.js';
import { exercise } from './exercise.js';
import { prediction } from './prediction.js';
import { process1D } from './process1D.js';
import { simulation } from './simulation.js';

export default {
  exercise,
  default: basic,
  process1D,
  prediction,
  assignment,
  embedded,
  simulation,
};
