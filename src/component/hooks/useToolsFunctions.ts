import lodashDebounce from 'lodash/debounce.js';
import lodashMap from 'lodash/map.js';
import { useCallback, useRef, useState } from 'react';
import { useToggleAccordion } from 'react-science/ui';

import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { TOOLS_PANELS_ACCORDION } from '../panels/Panels.js';
import { options } from '../toolbar/ToolTypes.js';

export default function useToolsFunctions() {
  const dispatch = useDispatch();
  const toaster = useToaster();

  const { open: openPanel } = useToggleAccordion();
  const [isRealSpectrumShown, setIsRealSpectrumShown] = useState(false);

  const debounceClickEventsRef = useRef<{ clicks: any[] }>({ clicks: [] });
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();
  const {
    toolOptions: { selectedTool: previousSelectedTool },
  } = useChartData();
  const handleChangeOption = useCallback(
    (selectedTool) => {
      //avoid reselecting the tool if it's already selected
      if (selectedTool === previousSelectedTool) {
        return;
      }

      if (
        [
          options.peakPicking.id,
          options.integral.id,
          options.zonePicking.id,
          options.exclusionZones.id,
          options.rangePicking.id,
        ].includes(selectedTool)
      ) {
        toaster.show({
          message: `Press ${!invert ? 'Shift +' : ''} Left Mouse button to select zone`,
        });
      }

      if (options[selectedTool].isFilter) {
        //Open the Processing accordion if the select tool is a filter
        openPanel('Processings');
      } else if (Object.keys(TOOLS_PANELS_ACCORDION).includes(selectedTool)) {
        openPanel(TOOLS_PANELS_ACCORDION[selectedTool]);
      }

      dispatch({
        type: 'SET_SELECTED_TOOL',
        payload: { selectedTool: selectedTool || options.zoom.id },
      });
    },
    [dispatch, invert, openPanel, previousSelectedTool, toaster],
  );

  const handleFullZoomOut = useCallback(() => {
    if (debounceClickEventsRef.current.clicks.length === 0) {
      dispatch({
        type: 'FULL_ZOOM_OUT',
        payload: { zoomType: 'HORIZONTAL' },
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
        type: 'FULL_ZOOM_OUT',
        payload: { zoomType: 'FULL' },
      });
    }
  }, [dispatch, debounceClickEventsRef]);

  const changeDisplayViewModeHandler = useCallback(() => {
    dispatch({
      type: 'CHANGE_SPECTRUM_DISPLAY_VIEW_MODE',
    });
  }, [dispatch]);

  const changeSpectrumViewHandler = useCallback(() => {
    dispatch({
      type: 'TOGGLE_REAL_IMAGINARY_VISIBILITY',
    });
    setIsRealSpectrumShown(!isRealSpectrumShown);
  }, [dispatch, isRealSpectrumShown]);

  const alignSpectraVerticallyHandler = useCallback(() => {
    dispatch({
      type: 'SET_SPECTRA_VERTICAL_ALIGN',
    });
  }, [dispatch]);

  return {
    handleChangeOption,
    handleFullZoomOut,
    changeDisplayViewModeHandler,
    changeSpectrumViewHandler,
    alignSpectraVerticallyHandler,
    isRealSpectrumShown,
  };
}
