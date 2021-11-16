export interface Integral {
  id: string;
  originFrom: number;
  originTo: number;
  from: number;
  to: number;
  absolute: number;
  integral?: number;
  kind: string;
}
