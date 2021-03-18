import lodashDebounce from 'lodash/debounce';
import lodashMap from 'lodash/map';
import { useCallback, useRef, useState } from 'react';

import { ZoomType } from '../reducer/actions/Zoom';
import {
  CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  EXPORT_DATA,
  FULL_ZOOM_OUT,
  SET_SELECTED_TOOL,
  SET_SPECTRUMS_VERTICAL_ALIGN,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
} from '../reducer/types/Types';

import { options } from './ToolTypes';

export default function useToolsFunctions(dispatch, alert) {
  const [isRealSpectrumShown, setIsRealSpectrumShown] = useState(false);
  const [isStacked, activateStackView] = useState(false);

  const debounceClickEventsRef = useRef({ clicks: [] });
  const handleChangeOption = useCallback(
    (selectedTool) => {
      if (
        [
          options.peakPicking.id,
          options.integral.id,
          options.zone2D.id,
        ].includes(selectedTool)
      ) {
        alert.show(
          'Press Shift + Left Mouse button to select zone for integral and peak picking',
        );
      }
      dispatch({ type: SET_SELECTED_TOOL, selectedTool });
    },
    [alert, dispatch],
  );

  const handleFullZoomOut = useCallback(() => {
    if (debounceClickEventsRef.current.clicks.length === 0) {
      dispatch({
        type: FULL_ZOOM_OUT,
        zoomType: ZoomType.HORIZONTAL,
      });
    }
    const callback = lodashDebounce(() => {
      debounceClickEventsRef.current.clicks = [];
    }, 500);
    debounceClickEventsRef.current.clicks.push(callback);

    callback();

    if (debounceClickEventsRef.current.clicks.length > 1) {
      lodashMap(debounceClickEventsRef.current.clicks, (debounce) =>
        debounce.cancel(),
      );
      debounceClickEventsRef.current.clicks = [];
      dispatch({
        type: FULL_ZOOM_OUT,
      });
    }
  }, [dispatch, debounceClickEventsRef]);

  const saveToClipboardHandler = useCallback(() => {
    dispatch({ type: EXPORT_DATA, exportType: 'copy' });
    alert.show('Spectrum copied to clipboard');
  }, [alert, dispatch]);

  const saveAsJSONHandler = useCallback(
    () => dispatch({ type: EXPORT_DATA, exportType: 'json' }),
    [dispatch],
  );

  const saveAsSVGHandler = useCallback(() => {
    dispatch({
      type: EXPORT_DATA,
      exportType: 'svg',
    });
  }, [dispatch]);

  const saveAsPNGHandler = useCallback(
    () => dispatch({ type: EXPORT_DATA, exportType: 'png' }),
    [dispatch],
  );

  const handleChangeDisplayViewMode = useCallback(() => {
    const flag = !isStacked;
    activateStackView(flag);
    dispatch({
      type: CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
      flag: flag,
    });
  }, [dispatch, isStacked]);

  const changeSpectrumViewHandler = useCallback(() => {
    dispatch({
      type: TOGGLE_REAL_IMAGINARY_VISIBILITY,
      isRealSpectrumVisible: !isRealSpectrumShown,
    });
    setIsRealSpectrumShown(!isRealSpectrumShown);
  }, [dispatch, isRealSpectrumShown]);

  const alignSpectrumsVerticallyHandler = useCallback(() => {
    dispatch({
      type: SET_SPECTRUMS_VERTICAL_ALIGN,
    });
  }, [dispatch]);

  return {
    handleChangeOption,
    handleFullZoomOut,
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
    handleChangeDisplayViewMode,
    changeSpectrumViewHandler,
    alignSpectrumsVerticallyHandler,
    isRealSpectrumShown,
    isStacked,
  };
}
