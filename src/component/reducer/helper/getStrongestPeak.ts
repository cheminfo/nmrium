import { max } from 'd3';
import { Draft } from 'immer';

import { Data1D } from '../../../data/types/data1d';
import { State } from '../Reducer';

import { getActiveSpectrum } from './getActiveSpectrum';

export function getStrongestPeak(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const activeData = draft.data[activeSpectrum?.index].data as Data1D;
    const strongestPeakValue = max(activeData.re) as number;
    const index = activeData.re.indexOf(strongestPeakValue);
    return {
      xValue: activeData.x[index],
      yValue: strongestPeakValue,
      index,
    };
  }
}
