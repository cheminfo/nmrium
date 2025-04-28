import type {
  IntegralsViewState,
  PeaksViewState,
  RangesViewState,
} from '@zakodium/nmrium-core';

import { useChartData } from '../../context/ChartContext.js';
import type { HistoryItem } from '../../reducer/helper/ZoomHistoryManager.js';

import { DraggableInset } from './DraggableInset.js';

export interface InsetBounding {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InsetView {
  ranges: RangesViewState;
  integrals: IntegralsViewState;
  peaks: PeaksViewState;
}
export interface Inset {
  id: string;
  bounding: InsetBounding;
  spectrumKey: string;
  xDomain: number[];
  yDomain: number[];
  zoomHistory: HistoryItem[];
  view: InsetView;
}

export type Insets = Record<string, Inset[]>;

export function SpectraInsets() {
  const insets = useInsets();

  if (!insets || insets?.length === 0) return null;

  return insets.map((inset) => {
    return <DraggableInset key={inset.id} {...inset} />;
  });
}

function useInsets() {
  const {
    insets,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  return insets?.[activeTab];
}
