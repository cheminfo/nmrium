import { useChartData } from '../context/ChartContext.tsx';
import { useDispatch } from '../context/DispatchContext.js';
import type { EventModifierKeys } from '../context/KeyModifierContext.js';
import { getModifiers } from '../context/KeyModifierContext.js';

export function useSetActiveSpectrumAction() {
  const dispatch = useDispatch();
  const { data: spectra } = useChartData();
  function setActiveSpectrum(event: EventModifierKeys, id: string) {
    setTimeout(() => {
      const { ctrlKey, shiftKey } = getModifiers(event);
      const modifier = `shift[${shiftKey ? 'true' : 'false'}]_ctrl[${
        ctrlKey ? 'true' : 'false'
      }]`;
      dispatch({
        type: 'CHANGE_ACTIVE_SPECTRUM',
        payload: { modifier, id, sortedSpectra: spectra },
      });
    }, 0);
  }

  return { setActiveSpectrum };
}
