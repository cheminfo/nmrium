import { scaleLinear } from 'd3-scale';

import { getViewSpectra } from '../../../data/get_view_spectra.ts';
import type { State } from '../../reducer/Reducer.ts';
import { getActiveSpectrum } from '../../reducer/helper/getActiveSpectrum.ts';
import type { AxisStyles } from '../../utility/getAxisLayout.ts';
import { getAxisLayout } from '../../utility/getAxisLayout.ts';
import { getVerticalAxisTicks } from '../../utility/getVerticalAxisTicks.ts';

import { getIndirectAxis } from './getIndirectAxis.ts';

interface TextMetrics {
  getTextWidth: (text: string) => number;
  getTextHeight: () => number;
}

// Reserves room for the widest right-axis tick and the vertical unit label.
export function getRightAxisMargin(
  state: State,
  axis: AxisStyles,
  metrics: TextMetrics,
) {
  // Use the same unit conversion and tick generation as the right axis.
  const activeSpectrum = getActiveSpectrum(state);
  const spectrum = getViewSpectra(state).find(
    (spectrum) => spectrum.id === activeSpectrum?.id,
  );
  const indirectAxis = getIndirectAxis(state, spectrum);
  const [, indirectNucleus] = state.view.spectra.activeTab.split(',', 2);
  const matchNucleus = /^[0-9]+[A-Z][a-z]?$/.test(indirectNucleus);
  const scale = scaleLinear(
    matchNucleus ? (indirectAxis?.domain ?? state.yDomain) : state.yDomain,
    [state.margin.top, state.height - state.margin.bottom],
  );
  const { tickFontSize } = getAxisLayout(axis);
  const { ticks } = getVerticalAxisTicks(scale, tickFontSize);

  // Reserve space for the widest tick number and the vertical unit label.
  const tickLabelWidth = Math.max(
    0,
    ...ticks.map(({ label }) => metrics.getTextWidth(label)),
  );
  return getAxisLayout(axis, {
    tickLabelWidth,
    labelHeight: metrics.getTextHeight(),
  }).right;
}
