import lodashDebounce from 'lodash/debounce';
import lodashMap from 'lodash/map';
import { useCallback, useRef, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { useAlert } from '../elements/popup/Alert';
import { ZoomType } from '../reducer/actions/Zoom';
import {
  CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  FULL_ZOOM_OUT,
  SET_SELECTED_TOOL,
  SET_SPECTRUMS_VERTICAL_ALIGN,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

export default function useToolsFunctions() {
  const dispatch = useDispatch();
  const alert = useAlert();
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
    handleChangeDisplayViewMode,
    changeSpectrumViewHandler,
    alignSpectrumsVerticallyHandler,
    isRealSpectrumShown,
    isStacked,
  };
}
