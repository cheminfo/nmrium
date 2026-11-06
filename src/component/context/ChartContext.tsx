import { produce } from 'immer';
import { createContext, use, useMemo } from 'react';

import { useIsInset } from '../1d/inset/InsetProvider.js';
import { getRightAxisMargin } from '../2d/utilities/getRightAxisMargin.ts';
import { useTextMetrics } from '../hooks/useTextMetrics.ts';
import { useViewportSize } from '../hooks/useViewportSize.js';
import { useTicksConfig } from '../hooks/use_ticks_config.ts';
import type { State } from '../reducer/Reducer.js';
import { initialState } from '../reducer/Reducer.js';
import { getAxisLayout } from '../utility/getAxisLayout.ts';

export const ChartDataContext = createContext<State>(initialState);

export function useChartData() {
  const data = use(ChartDataContext);

  const viewportSize = useViewportSize();
  const axis = useTicksConfig();
  const isInset = useIsInset();
  const layout = getAxisLayout(axis);
  const { getTextWidth } = useTextMetrics({
    ...axis.primaryTicks.textStyle,
    fontSize: layout.tickFontSize,
  });
  const { getTextHeight } = useTextMetrics({
    ...axis.labelStyle,
    fontSize: axis.labelStyle.fontSize ?? layout.fontSize,
  });

  return useMemo(() => {
    return produce(data, (draft) => {
      // 1. Apply export, print, or inset dimensions before calculating spacing.
      if (viewportSize) {
        const { width, height, margin, xDomain, yDomain } = viewportSize;
        draft.width = width;
        draft.height = height;
        draft.margin = margin ?? draft.margin;
        draft.xDomain = xDomain ?? draft.xDomain;
        draft.yDomain = yDomain ?? draft.yDomain;
      }

      // 2. Keep inset spacing unchanged; reserve bottom space for other axes.
      if (isInset) return;
      draft.margin.bottom = Math.max(draft.margin.bottom, layout.bottom);

      // 3. In 2D, leave room for tick numbers and the vertical right-axis unit.
      if (draft.displayerMode === '2D') {
        const right = getRightAxisMargin(draft, axis, {
          getTextWidth,
          getTextHeight,
        });
        draft.margin.right = Math.max(draft.margin.right, right);
      }
    });
  }, [
    axis,
    data,
    getTextHeight,
    getTextWidth,
    isInset,
    layout.bottom,
    viewportSize,
  ]);
}
