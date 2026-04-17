import type { ComponentType } from 'react';
import type { Control, FieldValues } from 'react-hook-form';

import type { AnchorData } from '../../../../1d/baseline/mapAnchors.ts';

interface BaseOptions {
  algorithm: string;
  livePreview: boolean;
  anchors?: AnchorData[];
}
export interface AirplsOptions extends BaseOptions {
  maxIterations: number;
  tolerance: number;
  lambda: number;
}
export interface PolynomialOptions extends BaseOptions {
  degree: number;
}
export interface WhittakerOptions extends BaseOptions {
  lambda: number;
  learningRate: number;
  maxIterations: number;
  tolerance: number;
}
export interface BernsteinOptions extends BaseOptions {
  maxIterations: number;
  tolerance: number;
  factorStd: number;
  learningRate: number;
  degree: number;
}
export interface CubicOptions extends BaseOptions {
  noiseThreshold: number;
  maxIterations: number;
  tolerance: number;
  noiseLevel: number;
  noisePercentile: number;
}
export type BaselineAlgorithmOptions =
  | AirplsOptions
  | PolynomialOptions
  | WhittakerOptions
  | BernsteinOptions
  | CubicOptions;

export interface BaselineAlgorithmFieldsMap {
  airpls: ComponentType<AlgorithmFieldProps<AirplsOptions>>;
  polynomial: ComponentType<AlgorithmFieldProps<PolynomialOptions>>;
  whittaker: ComponentType<AlgorithmFieldProps<WhittakerOptions>>;
  bernstein: ComponentType<AlgorithmFieldProps<BernsteinOptions>>;
  cubic: ComponentType<AlgorithmFieldProps<CubicOptions>>;
}

export interface AlgorithmFieldProps<T extends FieldValues> {
  control: Control<T>;
  onValueChange: () => void;
}
