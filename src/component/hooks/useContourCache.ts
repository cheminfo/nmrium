import { BasicContour } from 'ml-conrec/lib/BasicContourDrawer';
import { useState } from 'react';

export interface ContourResult {
  contours: BasicContour[];
  timeout: boolean;
}

export type ContourCache = Record<
  string,
  { positive?: ContourResult; negative?: ContourResult }
>;
const initialContourCache: ContourCache = {};
export function useContourCache() {
  return useState(initialContourCache);
}
