import { max } from 'd3';
import { Draft } from 'immer';

import { Data1D } from '../../../data/types/data1d';
import { State } from '../Reducer';

export function getStrongestPeak(draft: Draft<State>) {
  const { activeSpectrum, data } = draft;
  if (activeSpectrum) {
    const activeData = data[activeSpectrum?.index].data as Data1D;
    const strongestPeakValue = max(activeData.re);
    const index = activeData.re.findIndex((val) => val === strongestPeakValue);
    return {
      xValue: activeData.x[index],
      yValue: strongestPeakValue,
      index,
    };
  }
}
