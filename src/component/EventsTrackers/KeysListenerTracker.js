import { useCallback, useEffect } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useAlert } from '../elements/popup/Alert';
import { TYPES, useHighlightData } from '../highlight/index';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  DELETE_INTEGRAL,
  DELETE_PEAK_NOTATION,
  DELETE_RANGE,
  DELETE_2D_ZONE,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';
import useToolsFunctions from '../toolbar/useToolsFunctions';

function KeysListenerTracker() {
  const { keysPreferences, displayerMode, overDisplayer } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();
  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectrumsVerticallyHandler,
    handleChangeDisplayViewMode,
    saveToClipboardHandler,
    saveAsJSONHandler,
  } = useToolsFunctions(dispatch, alert);

  const { highlight } = useHighlightData();
  const assignmentData = useAssignmentData();

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
              id: data.activeKey,
              assignmentData,
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
        default:
          break;
      }
    },
    [assignmentData, dispatch],
  );

  const keysPreferencesListenerHandler = useCallback(
    (e, num) => {
      if (num >= 1 && num <= 9) {
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
    [alert, dispatch, keysPreferences],
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
          case 'r':
            handleChangeOption(options.rangesPicking.id);
            break;
          case 'b':
            handleChangeOption(options.baseLineCorrection.id);
            break;
          case 'p':
            handleChangeOption(options.peakPicking.id);
            break;
          case 'i': {
            const toolID =
              displayerMode === DISPLAYER_MODE.DM_2D
                ? options.zone2D.id
                : displayerMode === DISPLAYER_MODE.DM_1D
                ? options.integral.id
                : '';
            handleChangeOption(toolID);
            break;
          }
          case 'a':
            handleChangeOption(options.phaseCorrection.id);
            break;
          default:
        }
      }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        switch (e.key) {
          case 'c':
            alignSpectrumsVerticallyHandler();
            break;
          case 's':
            handleChangeDisplayViewMode();
            break;
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
          default:
        }
      }
      if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'S':
            saveAsJSONHandler(2);
            e.preventDefault();
            break;
          default:
        }
      }
    },
    [
      alignSpectrumsVerticallyHandler,
      displayerMode,
      handleChangeDisplayViewMode,
      handleChangeOption,
      handleFullZoomOut,
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
