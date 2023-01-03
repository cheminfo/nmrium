import { Info } from '../common/Info';

export interface Info1D extends Info {
  nucleus: string;
  originFrequency: number;
  digitalFilter?: number;
}
