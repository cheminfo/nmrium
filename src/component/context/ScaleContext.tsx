import type { ScaleLinear } from 'd3-scale';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { useIsInset } from '../1d/inset/InsetProvider.js';
import {
  getInsetXScale,
  getInsetYScale,
  getXScale,
  getYScale,
} from '../1d/utilities/scale.js';
import { useSpectraBottomMargin } from '../hooks/useSpectraBottomMargin.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';

import { useChartData } from './ChartContext.js';

type ScaleLinearNumberFunction = (
  spectrumId?: number | null | string,
) => ScaleLinear<number, number, number>;

interface ScaleState {
  scaleX: ScaleLinearNumberFunction | null;
  scaleY: ScaleLinearNumberFunction | null;
  shiftY: number;
  spectraBottomMargin: number;
}
const scaleInitialState: ScaleState = {
  scaleX: null,
  scaleY: null,
  shiftY: 0,
  spectraBottomMargin: 10,
};

const ScaleContext = createContext<ScaleState>(scaleInitialState);

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

export function ScaleProvider({ children }: Required<PropsWithChildren>) {
  const { mode, width, height, margin, xDomain, xDomains, yDomain, yDomains } =
    useChartData();
  const verticalAlign = useVerticalAlign();
  const spectraBottomMargin = useSpectraBottomMargin();

  const isInset = useIsInset();

  const scaleX = useCallback<ScaleLinearNumberFunction>(
    (spectrumId = null) => {
      if (isInset) {
        return getInsetXScale({
          width,
          xDomain,
          margin,
          mode,
        });
      }

      return getXScale({ width, margin, xDomains, xDomain, mode }, spectrumId);
    },
    [isInset, margin, mode, width, xDomain, xDomains],
  );

  const scaleY = useCallback<ScaleLinearNumberFunction>(
    (spectrumId = null) => {
      if (isInset) {
        return getInsetYScale({ height, yDomain, margin, spectraBottomMargin });
      }

      return getYScale(
        {
          height,
          margin,
          yDomains,
          yDomain,
          verticalAlign,
          spectraBottomMargin,
        },
        spectrumId,
      );
    },
    [
      spectraBottomMargin,
      height,
      isInset,
      margin,
      verticalAlign,
      yDomain,
      yDomains,
    ],
  );

  const scaleState = useMemo(() => {
    let shiftY = 0;

    if (verticalAlign === 'stack' && !isInset) {
      shiftY = height / (Object.keys(yDomains).length + 2);
    } else {
      shiftY = 0;
    }

    return { scaleX, scaleY, shiftY, spectraBottomMargin };
  }, [
    verticalAlign,
    isInset,
    scaleX,
    scaleY,
    height,
    yDomains,
    spectraBottomMargin,
  ]);

  return (
    <ScaleContext.Provider value={scaleState}>{children}</ScaleContext.Provider>
  );
}
