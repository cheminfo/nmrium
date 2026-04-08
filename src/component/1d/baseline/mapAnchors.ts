import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { NumberArray } from 'cheminfo-types';
import { xyMedianYAtXs } from 'ml-spectra-processing';

export interface AnchorData {
  x: number;
  id: string;
}
export function mapAnchors(spectrum: Spectrum1D, anchors: AnchorData[]) {
  const { data, info } = spectrum;
  const { x, re: y } = data;
  const sorted = anchors.toSorted((a, b) => a.x - b.x);
  const resultX = sorted.map((a) => a.x);
  const windowSize = info.numberOfPoints ? info.numberOfPoints / 200 : 41;
  return xyMedianYAtXs({ x, y }, resultX, { windowSize }) as {
    x: NumberArray;
    y: NumberArray;
  };
}
