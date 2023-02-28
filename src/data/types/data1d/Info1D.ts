import { Info } from '../common/Info';

export interface Info1D extends Info {
  nucleus: string;
  phc0?: number;
  phc1?: number;
  originFrequency: number;
  digitalFilter?: number;
}
