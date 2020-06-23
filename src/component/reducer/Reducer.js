import { setAutoFreeze } from 'immer';

import { options } from '../toolbar/ToolTypes';

import { setWidth, handleSetDimensions } from './actions/DimensionsActions';
import {
  handelResetDomain,
  setOriginalDomain,
  setXDomain,
  handleChangeIntegralYDomain,
} from './actions/DomainActions';
import {
  handleSetRangeInEdition,
  handleUnsetRangeInEdition,
  handleSetNewSignalDeltaSelectionIsEnabled,
  handleSetSelectedNewSignalDelta,
  handleUnsetSelectedNewSignalDelta,
} from './actions/EditRangeModalActions';
import { exportData } from './actions/ExportActions';
import {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  applyAutoPhaseCorrectionFilter,
  calculateManualPhaseCorrection,
  enableFilter,
  deleteFilter,
  handleBaseLineCorrectionFilter,
  filterSnapshotHandler,
  applyAbsoluteFilter,
} from './actions/FiltersActions';
import {
  handleHistoryUndo,
  handleHistoryRedo,
  handleHistoryReset,
} from './actions/HistoryActions';
import {
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
  handleChangeIntegralZoom,
  handleChangeIntegralSum,
} from './actions/IntegralsActions';
import {
  initiate,
  handleLoadJsonFile,
  loadJcampFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
  setData,
  setIsLoading,
  loadZipFile,
} from './actions/LoadActions';
import {
  handleAddMolecule,
  handleSetMolecule,
  handleDeleteMolecule,
} from './actions/MoleculeActions';
import {
  addPeak,
  addPeaks,
  deletePeak,
  handleAutoPeakPicking,
} from './actions/PeaksActions';
import {
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
} from './actions/PreferencesActions';
import {
  handleAutoRangesDetection,
  handleDeleteRange,
  handleChangeRange,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleSetShowMultiplicityTrees,
} from './actions/RangesActions';
import {
  handleSpectrumVisibility,
  handleChangePeaksMarkersVisibility,
  handleChangeActiveSpectrum,
  handleChangeSpectrumColor,
  handleDeleteSpectra,
  addMissingProjectionHander,
} from './actions/SpectrumsActions';
import {
  setSelectedTool,
  resetSelectedTool,
  setSelectedOptionPanel,
  setSpectrumsVerticalAlign,
  handleChangeSpectrumDisplayMode,
  handleAddBaseLineZone,
  handleDeleteBaseLineZone,
  handleToggleRealImaginaryVisibility,
  handleBrushEnd,
  setVerticalIndicatorXPosition,
  zoomOut,
  handleZoom,
  handelSetActiveTab,
  levelChangeHandler,
  projection2dHandler,
} from './actions/ToolsActions';
import { add2dZoneHandler, delete2ZoneHandler } from './actions/ZonesActions';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from './core/Constants';
import { UNDO, REDO, RESET } from './types/HistoryTypes';
import {
  INITIATE,
  ADD_PEAK,
  ADD_PEAKS,
  AUTO_PEAK_PICKING,
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
  LOAD_JCAMP_FILE,
  LOAD_JSON_FILE,
  LOAD_MOL_FILE,
  SET_DATA,
  SET_ORIGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_WIDTH,
  SET_DIMENSIONS,
  SET_SELECTED_TOOL,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  ADD_INTEGRAL,
  DELETE_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
  SET_ZOOM_FACTOR,
  ADD_MOLECULE,
  SET_MOLECULE,
  DELETE_MOLECULE,
  DELETE_SPECTRA,
  CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  SET_INTEGRAL_Y_DOMAIN,
  RESIZE_INTEGRAL,
  BRUSH_END,
  RESET_DOMAIN,
  CHANGE_INTEGRAL_ZOOM,
  ENABLE_FILTER,
  DELETE_FILTER,
  APPLY_ZERO_FILLING_FILTER,
  APPLY_FFT_FILTER,
  SET_VERTICAL_INDICATOR_X_POSITION,
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  APPLY_AUTO_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  SET_SELECTED_OPTIONS_PANEL,
  SET_LOADING_FLAG,
  RESET_SELECTED_TOOL,
  AUTO_RANGES_DETECTION,
  DELETE_RANGE,
  SET_SPECTRUMS_VERTICAL_ALIGN,
  CHANGE_INTEGRAL_DATA,
  EXPORT_DATA,
  SET_PREFERENCES,
  SET_ACTIVE_TAB,
  CHANGE_INTEGRAL_SUM,
  ADD_BASE_LINE_ZONE,
  DELETE_BASE_LINE_ZONE,
  APPLY_BASE_LINE_CORRECTION_FILTER,
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  LOAD_ZIP_FILE,
  CHANGE_RANGE_DATA,
  CHANGE_RANGE_SUM,
  ADD_RANGE,
  SET_2D_LEVEL,
  RESIZE_RANGE,
  ADD_2D_ZONE,
  DELETE_2D_ZONE,
  SET_2D_PROJECTION,
  ADD_MISSING_PROJECTION,
  SET_FILTER_SNAPSHOT,
  APPLY_ABSOLUTE_FILTER,
  SET_RANGE_IN_EDITION,
  UNSET_RANGE_IN_EDITION,
  SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
  SET_SELECTED_NEW_SIGNAL_DELTA,
  UNSET_SELECTED_NEW_SIGNAL_DELTA,
  SET_SHOW_MULTIPLICITY_TREES,
} from './types/Types';

setAutoFreeze(false);

export const initialState = {
  data: null,
  contours: null,
  tempData: null,
  xDomain: [],
  yDomain: [],
  yDomains: {},
  xDomains: {},
  originDomain: {},
  integralsYDomains: {},
  originIntegralYDomain: {},
  selectedTool: options.zoom.id,
  selectedFilter: null,
  selectedOptionPanel: null,
  activeTab: null,
  width: 0,
  height: 0,
  margin: {
    top: 10,
    right: 20,
    bottom: 70,
    left: 0,
  },
  activeSpectrum: null,
  mode: 'RTL',
  zoomFactor: { scale: 1 },
  integralZoomFactor: { scale: 0.5 },
  molecules: [],
  verticalAlign: {
    flag: false,
    stacked: false,
    value: DEFAULT_YAXIS_SHIFT_VALUE,
  },
  history: {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  },
  pivot: 0,
  isLoading: false,
  preferences: {},
  baseLineZones: [],
  keysPreferences: {},
  displayerMode: DISPLAYER_MODE.DM_1D,
  tabActiveSpectrum: {},
};

export function dispatchMiddleware(dispatch) {
  return (action) => {
    switch (action.type) {
      case LOAD_ZIP_FILE:
        loadZipFile(action.files).then(() => {
          dispatch(action);
        });
        break;

      default:
        return dispatch(action);
    }
  };
}

export function spectrumReducer(state, action) {
  switch (action.type) {
    case INITIATE:
      return initiate(state, action.data);
    case SET_LOADING_FLAG:
      return setIsLoading(state, action.isLoading);
    case LOAD_JSON_FILE:
      return handleLoadJsonFile(state, action.data);
    case LOAD_JCAMP_FILE:
      return loadJcampFile(state, action.files);
    case LOAD_MOL_FILE:
      return handleLoadMOLFile(state, action.files);
    case LOAD_ZIP_FILE:
      return handleLoadZIPFile(state, action.files);

    case EXPORT_DATA:
      return exportData(state, action);
    case ADD_PEAK:
      return addPeak(state, action.mouseCoordinates);
    case ADD_PEAKS:
      return addPeaks(state, action);

    case DELETE_PEAK_NOTATION:
      return deletePeak(state, action.data);

    case ADD_INTEGRAL:
      return addIntegral(state, action);
    case DELETE_INTEGRAL:
      return deleteIntegral(state, action);
    case CHANGE_INTEGRAL_DATA:
      return changeIntegral(state, action);

    case RESIZE_INTEGRAL:
      return handleResizeIntegral(state, action);

    case SET_ORIGINAL_DOMAIN:
      return setOriginalDomain(state, action.domain);

    case SET_X_DOMAIN:
      return setXDomain(state, action.xDomain);

    case SET_WIDTH:
      return setWidth(state, action.width);

    case SET_DIMENSIONS:
      return handleSetDimensions(state, action.width, action.height);

    case SET_SELECTED_TOOL:
      return setSelectedTool(state, action.selectedTool);
    case RESET_SELECTED_TOOL:
      return resetSelectedTool(state);
    case SET_SELECTED_OPTIONS_PANEL:
      return setSelectedOptionPanel(state, action.selectedOptionPanel);
    case SET_DATA:
      return setData(state, action.data);
    case FULL_ZOOM_OUT:
      return zoomOut(state, action);
    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);
    case APPLY_ZERO_FILLING_FILTER:
      return applyZeroFillingFilter(state, action.value);
    case APPLY_FFT_FILTER:
      return applyFFTFilter(state);
    case APPLY_MANUAL_PHASE_CORRECTION_FILTER:
      return applyManualPhaseCorrectionFilter(state, action.value);
    case APPLY_AUTO_PHASE_CORRECTION_FILTER:
      return applyAutoPhaseCorrectionFilter(state, action.value);
    case APPLY_ABSOLUTE_FILTER:
      return applyAbsoluteFilter(state);
    case CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return calculateManualPhaseCorrection(state, action.value);
    case ENABLE_FILTER:
      return enableFilter(state, action.id, action.checked);
    case DELETE_FILTER:
      return deleteFilter(state, action.id);
    case SET_FILTER_SNAPSHOT:
      return filterSnapshotHandler(state, action);

    case CHANGE_VISIBILITY:
      return handleSpectrumVisibility(state, action);

    case CHANGE_PEAKS_MARKERS_VISIBILITY:
      return handleChangePeaksMarkersVisibility(state, action.data);
    case CHANGE_ACTIVE_SPECTRUM:
      return handleChangeActiveSpectrum(state, action.data);

    case CHANGE_SPECTRUM_COLOR:
      return handleChangeSpectrumColor(state, action.data);
    case TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return handleToggleRealImaginaryVisibility(state);
    case SET_ZOOM_FACTOR:
      return handleZoom(state, action);
    // return {
    //   ...state,
    //   zoomFactor: action.zoomFactor,
    // };

    case CHANGE_SPECTRUM_DISPLAY_VIEW_MODE:
      return handleChangeSpectrumDisplayMode(state, action);

    case ADD_MOLECULE:
      return handleAddMolecule(state, action.molfile);

    case SET_MOLECULE:
      return handleSetMolecule(state, action.molfile, action.key);

    case DELETE_MOLECULE:
      return handleDeleteMolecule(state, action.key);

    case DELETE_SPECTRA:
      return handleDeleteSpectra(state, action);

    case SET_INTEGRAL_Y_DOMAIN:
      return handleChangeIntegralYDomain(state, action.yDomain);

    case CHANGE_INTEGRAL_ZOOM:
      return handleChangeIntegralZoom(state, action);

    case CHANGE_INTEGRAL_SUM:
      return handleChangeIntegralSum(state, action.value);

    case BRUSH_END:
      return handleBrushEnd(state, action);

    case SET_VERTICAL_INDICATOR_X_POSITION:
      return setVerticalIndicatorXPosition(state, action.position);
    case SET_SPECTRUMS_VERTICAL_ALIGN:
      return setSpectrumsVerticalAlign(state, action.flag);

    case AUTO_PEAK_PICKING:
      return handleAutoPeakPicking(state, action.options);

    case AUTO_RANGES_DETECTION:
      return handleAutoRangesDetection(state, action.options);
    case ADD_RANGE:
      return handleAddRange(state, action);
    case DELETE_RANGE:
      return handleDeleteRange(state, action.rangeID);
    case CHANGE_RANGE_DATA:
      return handleChangeRange(state, action);
    case RESIZE_RANGE:
      return handleResizeRange(state, action);
    case CHANGE_RANGE_SUM:
      return handleChangeRangeSum(state, action.value);
    case SET_PREFERENCES:
      return handelSetPreferences(state, action.data);
    case SET_ACTIVE_TAB:
      return handelSetActiveTab(state, action.tab);
    case ADD_BASE_LINE_ZONE:
      return handleAddBaseLineZone(state, action.zone);
    case DELETE_BASE_LINE_ZONE:
      return handleDeleteBaseLineZone(state, action.id);
    case APPLY_BASE_LINE_CORRECTION_FILTER:
      return handleBaseLineCorrectionFilter(state, action);
    case SET_KEY_PREFERENCES:
      return setKeyPreferencesHandler(state, action.keyCode);
    case APPLY_KEY_PREFERENCES:
      return applyKeyPreferencesHandler(state, action.keyCode);
    case SET_2D_LEVEL:
      return levelChangeHandler(state, action);
    case ADD_2D_ZONE:
      return add2dZoneHandler(state, action);
    case DELETE_2D_ZONE:
      return delete2ZoneHandler(state, action);
    case SET_2D_PROJECTION:
      return projection2dHandler(state, action);
    case ADD_MISSING_PROJECTION:
      return addMissingProjectionHander(state, action);
    case SET_SHOW_MULTIPLICITY_TREES:
      return handleSetShowMultiplicityTrees(state, action);

    case RESET_DOMAIN:
      return handelResetDomain(state);
    case UNDO:
      return handleHistoryUndo(state);

    case REDO:
      return handleHistoryRedo(state);

    case RESET:
      return handleHistoryReset(state, action);

    case SET_RANGE_IN_EDITION:
      return handleSetRangeInEdition(state, action);

    case UNSET_RANGE_IN_EDITION:
      return handleUnsetRangeInEdition(state);

    case SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED:
      return handleSetNewSignalDeltaSelectionIsEnabled(state, action);

    case SET_SELECTED_NEW_SIGNAL_DELTA:
      return handleSetSelectedNewSignalDelta(state, action);

    case UNSET_SELECTED_NEW_SIGNAL_DELTA:
      return handleUnsetSelectedNewSignalDelta(state);

    default:
      return state;
  }
}
