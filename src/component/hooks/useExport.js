import { useCallback } from 'react';

import { toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useAlert } from '../elements/popup/Alert';
import { SET_LOADING_FLAG } from '../reducer/types/Types';
import {
  exportAsJSON,
  exportAsNMRE,
  exportAsPng,
  exportAsSVG,
} from '../utility/Export';
import { toNmredata } from '../utility/toNmredata';

export default function useExport() {
  const dispatch = useDispatch();
  const alert = useAlert();
  const state = useChartData();

  const saveToClipboardHandler = useCallback(() => {
    if (state.data.length > 0) {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      setTimeout(() => {
        // eslint-disable-next-line no-undef
        copyPNGToClipboard('nmrSVG');
        dispatch({ type: SET_LOADING_FLAG, isLoading: false });
        alert.show('Spectrum copied to clipboard');
      }, 0);
    }
  }, [alert, dispatch, state]);

  const saveAsJSONHandler = useCallback(
    (spaceIndent = 0, isCompressed = true) => {
      if (state.data.length > 0) {
        dispatch({ type: SET_LOADING_FLAG, isLoading: true });
        setTimeout(async () => {
          //exported file name by default will be the first spectrum name
          const fileName = state.data[0]?.display?.name;
          const exportedData = toJSON(state);
          await exportAsJSON(exportedData, fileName, spaceIndent, isCompressed);
          dispatch({ type: SET_LOADING_FLAG, isLoading: false });
        }, 0);
      }
    },
    [dispatch, state],
  );

  const saveAsNMREHandler = useCallback(() => {
    if (state.data.length > 0) {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      setTimeout(() => {
        const fileName = state.data[0]?.display?.name;
        const exportedData = toNmredata(state);
        exportAsNMRE(exportedData, fileName);
        dispatch({ type: SET_LOADING_FLAG, isLoading: false });
      }, 0);
    }
  }, [dispatch, state]);

  const saveAsSVGHandler = useCallback(() => {
    if (state.data.length > 0) {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      setTimeout(() => {
        const fileName = state.data[0]?.display?.name;
        exportAsSVG(fileName, 'nmrSVG');
        dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      }, 0);
    }
  }, [dispatch, state.data]);

  const saveAsPNGHandler = useCallback(() => {
    if (state.data.length > 0) {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      setTimeout(() => {
        const fileName = state.data[0]?.display?.name;
        exportAsPng(fileName, 'nmrSVG');
      }, 0);
    }
  }, [dispatch, state.data]);

  return {
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsNMREHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
  };
}
