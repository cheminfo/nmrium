import type { ScaleLinear } from 'd3';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { getXScale, getYScale } from '../1d/utilities/scale.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';

import { useChartData } from './ChartContext.js';

type ScaleLinearNumberFunction = (
  spectrumId?: number | null | string,
) => ScaleLinear<number, number, number>;

interface ScaleState {
  scaleX: ScaleLinearNumberFunction | null;
  scaleY: ScaleLinearNumberFunction | null;
  shiftY: number;
}
const scaleInitialState: ScaleState = {
  scaleX: null,
  scaleY: null,
  shiftY: 0,
};

export const ScaleContext = createContext<ScaleState>(scaleInitialState);

export function useScale() {
  return useContext(ScaleContext);
}

type CheckedScaleState = {
  [key in keyof ScaleState]: Exclude<ScaleState[key], null>;
};

export function useScaleChecked(): CheckedScaleState {
  const scale = useScale();
  if (!scale.scaleX || !scale.scaleY) {
    throw new Error('scale cannot be null');
  }

  return scale as CheckedScaleState;
}

export function ScaleProvider({ children }) {
  const { mode, width, height, margin, xDomain, xDomains, yDomain, yDomains } =
    useChartData();
  const verticalAlign = useVerticalAlign();

  const scaleX = useCallback<ScaleLinearNumberFunction>(
    (spectrumId = null) => {
      return getXScale({ width, margin, xDomains, xDomain, mode }, spectrumId);
    },
    [margin, mode, width, xDomain, xDomains],
  );

  const scaleY = useCallback<ScaleLinearNumberFunction>(
    (spectrumId = null) => {
      return getYScale(
        { height, margin, yDomains, yDomain, verticalAlign },
        spectrumId,
      );
    },
    [height, margin, verticalAlign, yDomain, yDomains],
  );

  const scaleState = useMemo(() => {
    let shiftY = 0;

    if (verticalAlign === 'stack') {
      shiftY = height / (Object.keys(yDomains).length + 2);
    } else {
      shiftY = 0;
    }

    return { scaleX, scaleY, shiftY };
  }, [verticalAlign, scaleX, scaleY, height, yDomains]);

  return (
    <ScaleContext.Provider value={scaleState}>{children}</ScaleContext.Provider>
  );
}
