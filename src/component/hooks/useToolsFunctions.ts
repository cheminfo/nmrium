import { useToggleAccordion } from 'analysis-ui-components';
import lodashDebounce from 'lodash/debounce';
import lodashMap from 'lodash/map';
import { useCallback, useRef, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { useAlert } from '../elements/popup/Alert';
import { TOOLS_PANELS_ACCORDION } from '../panels/Panels';
import { ZoomType } from '../reducer/helper/Zoom1DManager';
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

  const { open: openPanel } = useToggleAccordion();
  const [isRealSpectrumShown, setIsRealSpectrumShown] = useState(false);

  const debounceClickEventsRef = useRef<{ clicks: Array<any> }>({ clicks: [] });
  const handleChangeOption = useCallback(
    (selectedTool) => {
      if (
        [
          options.peakPicking.id,
          options.integral.id,
          options.zonePicking.id,
          options.exclusionZones.id,
        ].includes(selectedTool)
      ) {
        alert.show('Press Shift + Left Mouse button to select zone');
      }

      if (Object.keys(TOOLS_PANELS_ACCORDION).includes(selectedTool)) {
        openPanel(TOOLS_PANELS_ACCORDION[selectedTool]);
      }

      dispatch({
        type: SET_SELECTED_TOOL,
        payload: { selectedTool },
      });
    },
    [alert, dispatch, openPanel],
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

  const changeDisplayViewModeHandler = useCallback(() => {
    dispatch({
      type: CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
    });
  }, [dispatch]);

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
    changeDisplayViewModeHandler,
    changeSpectrumViewHandler,
    alignSpectrumsVerticallyHandler,
    isRealSpectrumShown,
  };
}
