import { useCallback, useEffect, useMemo } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { useAlert } from '../elements/popup/Alert';
import { TYPES, useHighlightData } from '../highlight/index';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  DELETE_INTEGRAL,
  DELETE_PEAK_NOTATION,
  DELETE_RANGE,
  DELETE_2D_ZONE,
  DELETE_EXCLUSION_ZONE,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

function KeysListenerTracker() {
  const { keysPreferences, displayerMode, overDisplayer, data } =
    useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();
  const loader = useLoader();

  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectrumsVerticallyHandler,
    changeDisplayViewModeHandler,
  } = useToolsFunctions();

  const { saveToClipboardHandler, saveAsJSONHandler, saveAsHandler } =
    useExport();

  const { highlight } = useHighlightData();
  const assignmentData = useAssignmentData();

  const allow1DTool = useMemo(() => {
    return displayerMode === DISPLAYER_MODE.DM_1D && data && data.length > 0;
  }, [data, displayerMode]);

  const allow2DTool = useMemo(() => {
    return displayerMode === DISPLAYER_MODE.DM_2D && data && data.length > 0;
  }, [data, displayerMode]);

  const deleteHandler = useCallback(
    (type, data) => {
      switch (type) {
        case TYPES.INTEGRAL: {
          dispatch({
            type: DELETE_INTEGRAL,
            integralID: data.activeKey,
          });
          break;
        }
        case TYPES.PEAK: {
          dispatch({
            type: DELETE_PEAK_NOTATION,
            data: { id: data.activeKey },
          });
          break;
        }
        case TYPES.RANGE: {
          dispatch({
            type: DELETE_RANGE,
            payload: {
              data: {
                id: data.activeKey,
                assignmentData,
              },
            },
          });
          break;
        }
        case TYPES.ZONE: {
          dispatch({
            type: DELETE_2D_ZONE,
            payload: {
              id: data.activeKey,
              assignmentData,
            },
          });
          break;
        }
        case TYPES.EXCLUSION_ZONE: {
          dispatch({
            type: DELETE_EXCLUSION_ZONE,
            payload: {
              id: data.activeKey,
            },
          });
          break;
        }
        default:
          break;
      }
    },
    [assignmentData, dispatch],
  );

  const keysPreferencesListenerHandler = useCallback(
    (e, num) => {
      if (data && data.length > 0 && num >= 1 && num <= 9) {
        if (e.shiftKey) {
          dispatch({
            type: SET_KEY_PREFERENCES,
            keyCode: num,
          });
          alert.show(`Configuration Reset, press '${num}' again to reload it.`);
        } else {
          if (!checkModifierKeyActivated(e)) {
            if (keysPreferences && keysPreferences[num]) {
              dispatch({
                type: APPLY_KEY_PREFERENCES,
                keyCode: num,
              });
            } else {
              dispatch({
                type: SET_KEY_PREFERENCES,
                keyCode: num,
              });
              alert.show(
                `Configuration saved, press '${num}' again to reload it.`,
              );
            }
          }
        }
      }
    },
    [alert, data, dispatch, keysPreferences],
  );

  const toolsListenerHandler = useCallback(
    (e) => {
      if (!e.shiftKey && !e.metaKey) {
        switch (e.key) {
          case 'f':
            handleFullZoomOut();
            break;
          case 'z':
          case 'Escape':
            handleChangeOption(options.zoom.id);
            break;
          case 'r': {
            const toolID = allow2DTool
              ? options.zone2D.id
              : allow1DTool
              ? options.rangesPicking.id
              : '';
            handleChangeOption(toolID);
            break;
          }
          case 'a': {
            if (allow1DTool) {
              handleChangeOption(options.phaseCorrection.id);
            }
            break;
          }
          case 'b': {
            if (allow1DTool) {
              handleChangeOption(options.baseLineCorrection.id);
            }
            break;
          }
          case 'p': {
            if (allow1DTool) {
              handleChangeOption(options.peakPicking.id);
            }
            break;
          }
          case 'i': {
            if (allow1DTool) {
              handleChangeOption(options.integral.id);
            }
            break;
          }
          default:
        }
      }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        switch (e.key) {
          case 'c': {
            if (allow1DTool) {
              alignSpectrumsVerticallyHandler();
            }
            break;
          }
          case 's': {
            if (allow1DTool) {
              changeDisplayViewModeHandler();
            }
            break;
          }
          default:
        }
      }

      if (!e.shiftKey && (e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'c':
            saveToClipboardHandler();
            e.preventDefault();
            break;
          case 's':
            saveAsJSONHandler();
            e.preventDefault();
            break;
          case 'o':
            loader.open();
            e.preventDefault();
            break;
          default:
        }
      }
      if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 's':
          case 'S':
            saveAsHandler();
            e.preventDefault();
            break;
          default:
        }
      }
    },
    [
      alignSpectrumsVerticallyHandler,
      allow1DTool,
      allow2DTool,
      changeDisplayViewModeHandler,
      handleChangeOption,
      handleFullZoomOut,
      loader,
      saveAsHandler,
      saveAsJSONHandler,
      saveToClipboardHandler,
    ],
  );

  const handleOnKeyDown = useCallback(
    (e) => {
      const {
        highlighted: [activeKey],
        type,
      } = highlight;
      if (
        !['input', 'textarea'].includes(e.target.localName) &&
        overDisplayer
      ) {
        const num = Number(e.code.substr(e.code.length - 1)) || 0;
        if (num > 0) {
          keysPreferencesListenerHandler(e, num);
        } else {
          if ([('Escape', 'Esc', 'Backspace')].includes(e.key) && type) {
            deleteHandler(type, { activeKey });
          } else {
            toolsListenerHandler(e);
          }
        }
      }
    },
    [
      deleteHandler,
      highlight,
      keysPreferencesListenerHandler,
      overDisplayer,
      toolsListenerHandler,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDown, true);

    return () => document.removeEventListener('keydown', handleOnKeyDown, true);
  }, [handleOnKeyDown]);

  return null;
}

export default KeysListenerTracker;
