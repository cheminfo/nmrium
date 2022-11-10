import { useKbs } from 'react-kbs';

import { useAssignmentData } from '../assignment/AssignmentsContext';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import { HighlightEventSource, useHighlightData } from '../highlight/index';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  DELETE_INTEGRAL,
  DELETE_PEAK_NOTATION,
  DELETE_RANGE,
  DELETE_2D_ZONE,
  DELETE_EXCLUSION_ZONE,
  DELETE_ANALYZE_SPECTRA_RANGE,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

import { useCheckToolsVisibility } from './useCheckToolsVisibility';
import useExport from './useExport';
import useToolsFunctions from './useToolsFunctions';

function throw1DSelectSpectraError(label: string, displayerMode) {
  throw new Error(
    `${
      displayerMode === DISPLAYER_MODE.DM_2D
        ? `Switch to 1D Mode and select a spectrum to proceed width ${label}`
        : `Select a spectrum to proceed  width ${label}`
    }`,
  );
}

export function useKeyboardShortcuts() {
  const { keysPreferences, displayerMode, data } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();
  const modal = useModal();
  const openLoader = useLoader();

  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectrumsVerticallyHandler,
    changeDisplayViewModeHandler,
  } = useToolsFunctions();

  const { saveToClipboardHandler, saveAsJSONHandler, saveAsHandler } =
    useExport();
  const isToolVisible = useCheckToolsVisibility();

  const { highlight, remove } = useHighlightData();

  const assignmentData = useAssignmentData();
  const allow1DTool =
    displayerMode === DISPLAYER_MODE.DM_1D && data && data.length > 0;

  function keysPreferencesListenerHandler(e) {
    const number = Number(e.code.replace(/^\D+/g, ''));
    if (data && data.length > 0 && number >= 1 && number <= 9) {
      if (e.shiftKey) {
        dispatch({
          type: SET_KEY_PREFERENCES,
          keyCode: number,
        });
        alert.show(
          `Configuration Reset, press '${number}' again to reload it.`,
        );
      } else if (keysPreferences?.[number]) {
        dispatch({
          type: APPLY_KEY_PREFERENCES,
          keyCode: number,
        });
      } else {
        dispatch({
          type: SET_KEY_PREFERENCES,
          keyCode: number,
        });
        alert.show(
          `Configuration saved, press '${number}' again to reload it.`,
        );
      }
    }
  }

  function deleteHandler(e) {
    e.preventDefault();
    if (highlight.sourceData) {
      const { type, extra } = highlight.sourceData;
      switch (type) {
        case HighlightEventSource.INTEGRAL: {
          dispatch({
            type: DELETE_INTEGRAL,
            integralID: extra?.id,
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightEventSource.PEAK: {
          dispatch({
            type: DELETE_PEAK_NOTATION,
            data: { id: extra?.id },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightEventSource.RANGE: {
          dispatch({
            type: DELETE_RANGE,
            payload: {
              data: {
                id: extra?.id,
                assignmentData,
              },
            },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightEventSource.ZONE: {
          dispatch({
            type: DELETE_2D_ZONE,
            payload: {
              id: extra?.id,
              assignmentData,
            },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightEventSource.EXCLUSION_ZONE: {
          const buttons = [
            {
              text: 'Yes, for all spectra',
              handler: async () => {
                const hideLoading = await alert.showLoading(
                  'Delete all spectra exclusive zones in progress',
                );
                dispatch({
                  type: DELETE_EXCLUSION_ZONE,
                  payload: {
                    zone: extra?.zone,
                  },
                });
                hideLoading();
              },
            },
            {
              text: 'Yes',
              handler: async () => {
                const hideLoading = await alert.showLoading(
                  'Delete exclusive zone in progress',
                );
                dispatch({
                  type: DELETE_EXCLUSION_ZONE,
                  payload: {
                    zone: extra?.zone,
                    spectrumID: extra?.spectrumID,
                  },
                });
                hideLoading();
              },
            },
            { text: 'No' },
          ];

          modal.showConfirmDialog({
            message: 'Are you sure you want to delete the exclusion zone/s?',
            buttons,
          });

          break;
        }
        case HighlightEventSource.MULTIPLE_ANALYSIS_ZONE: {
          dispatch({
            type: DELETE_ANALYZE_SPECTRA_RANGE,
            colKey: extra?.colKey,
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }

        default:
          break;
      }
    }
  }

  function handleZoomOut() {
    if (isToolVisible('zoomOut')) {
      handleFullZoomOut();
    }
  }
  function handleZoom() {
    if (isToolVisible('zoom')) {
      handleChangeOption(options.zoom.id);
    }
  }
  function handleRangesAndZonesPicking() {
    if (isToolVisible('zonePicking')) {
      handleChangeOption(options.zonePicking.id);
    } else if (isToolVisible('rangePicking')) {
      handleChangeOption(options.rangePicking.id);
    } else {
      const label =
        displayerMode === DISPLAYER_MODE.DM_2D
          ? options.zonePicking.label
          : options.rangePicking.label;
      throw new Error(`Select a spectrum to proceed with ${label} `);
    }
  }
  function handleApodizationAndPhaseCorrectionFilter() {
    if (isToolVisible('apodization')) {
      handleChangeOption(options.apodization.id);
    } else if (isToolVisible('phaseCorrection')) {
      handleChangeOption(options.phaseCorrection.id);
    } else {
      throw1DSelectSpectraError(
        `${options.phaseCorrection.label} or ${options.apodization.label}`,
        displayerMode,
      );
    }
  }

  function handleBaseLineCorrection() {
    if (isToolVisible('baselineCorrection')) {
      handleChangeOption(options.baselineCorrection.id);
    } else {
      throw1DSelectSpectraError(
        options.baselineCorrection.label,
        displayerMode,
      );
    }
  }
  function handlePeakPicking() {
    if (isToolVisible('peakPicking')) {
      handleChangeOption(options.peakPicking.id);
    } else {
      throw1DSelectSpectraError(options.peakPicking.label, displayerMode);
    }
  }
  function handleIntegralPicking() {
    if (isToolVisible('integral')) {
      handleChangeOption(options.integral.id);
    } else {
      throw1DSelectSpectraError(options.integral.label, displayerMode);
    }
  }
  function handleExclusionZonePicking() {
    if (isToolVisible('exclusionZones')) {
      handleChangeOption(options.exclusionZones.id);
    } else if (displayerMode !== DISPLAYER_MODE.DM_1D) {
      throw new Error('Switch to 1D Mode');
    }
  }
  function handleAlignSpectraVertical() {
    if (allow1DTool && isToolVisible('spectraCenterAlignments')) {
      alignSpectrumsVerticallyHandler();
    }
  }
  function handleStackSpectra() {
    if (allow1DTool && isToolVisible('spectraStackAlignments')) {
      changeDisplayViewModeHandler();
    }
  }

  const shortcutProps = useKbs([
    {
      shortcut: [
        { code: 'Digit1' },
        { code: 'Digit2' },
        { code: 'Digit3' },
        { code: 'Digit4' },
        { code: 'Digit5' },
        { code: 'Digit6' },
        { code: 'Digit7' },
        { code: 'Digit8' },
        { code: 'Digit9' },
      ],
      handler: keysPreferencesListenerHandler,
    },
    {
      shortcut: ['Delete', 'Backspace'],
      handler: deleteHandler,
    },
    {
      shortcut: { key: 'f', shift: false },
      handler: handleZoomOut,
    },
    {
      shortcut: [{ key: 'z', shift: false }, 'Escape'],
      handler: handleZoom,
    },
    {
      shortcut: { key: 'r', shift: false },
      handler: handleRangesAndZonesPicking,
    },
    {
      shortcut: { key: 'a', shift: false },
      handler: handleApodizationAndPhaseCorrectionFilter,
    },
    {
      shortcut: { key: 'b', shift: false },
      handler: handleBaseLineCorrection,
    },
    {
      shortcut: { key: 'p', shift: false },
      handler: handlePeakPicking,
    },
    {
      shortcut: { key: 'i', shift: false },
      handler: handleIntegralPicking,
    },
    {
      shortcut: { key: 'e', shift: false },
      handler: handleExclusionZonePicking,
    },
    {
      shortcut: { key: 'c', shift: false },
      handler: handleAlignSpectraVertical,
    },
    {
      shortcut: { key: 's', shift: false, ctrl: false },
      handler: handleStackSpectra,
    },
    {
      shortcut: { key: 'c', shift: false, ctrl: true },
      handler: (e) => {
        e.preventDefault();
        void saveToClipboardHandler();
      },
    },
    {
      shortcut: { key: 's', shift: false, ctrl: true },
      handler: (e) => {
        e.preventDefault();
        if (isToolVisible('exportAs')) {
          saveAsJSONHandler();
        }
      },
    },
    {
      shortcut: { key: 'o', shift: false, ctrl: true },
      handler: (e) => {
        e.preventDefault();
        openLoader();
      },
    },
    {
      shortcut: { key: 's', shift: true, ctrl: true },
      handler: (e) => {
        e.preventDefault();
        void saveAsHandler();
      },
    },
  ]);

  return shortcutProps;
}
