import { BasicContour } from 'ml-conrec/lib/BasicContourDrawer';
import { useState } from 'react';

interface ContourResult {
  contour: BasicContour[];
  timeout: boolean;
}
const initialContourCache: Record<
  string,
  { positive: ContourResult; negative: ContourResult }
> = {};
export function useContourCache() {
  return useState(initialContourCache);
}
