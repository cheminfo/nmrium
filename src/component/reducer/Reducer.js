import { options } from '../toolbar/ToolTypes';

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
} from './types/Types';
import {
  handelResetDomain,
  setOriginalDomain,
  setXDomain,
  handleChangeIntegralYDomain,
} from './actions/DomainActions';
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
} from './actions/ToolsActions';
import {
  initiate,
  handleLoadJsonFile,
  loadJcampFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
  setData,
  setIsLoading,
} from './actions/LoadActions';
import {
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
} from './actions/PreferencesActions';
import { DEFAULT_YAXIS_SHIFT_VALUE } from './core/Constants';
import {
  handleAddMolecule,
  handleSetMolecule,
  handleDeleteMolecule,
} from './actions/MoleculeActions';
import {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  calculateManualPhaseCorrection,
  enableFilter,
  deleteFilter,
  handleBaseLineCorrectionFilter,
} from './actions/FiltersActions';
import { exportData } from './actions/ExportActions';
import {
  addPeak,
  addPeaks,
  deletePeak,
  handleAutoPeakPicking,
} from './actions/PeaksActions';
import {
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
  handleChangeIntegralZoom,
  handleChangeIntegralSum,
} from './actions/IntegralsActions';
import { setWidth, handleSetDimensions } from './actions/DimensionsActions';
import {
  handleSpectrumVisibility,
  handleChangePeaksMarkersVisibility,
  handleChangeActiveSpectrum,
  handleChangeSpectrumColor,
  handleDeleteSpectra,
} from './actions/SpectrumsActions';
import {
  handleAutoRangesDetection,
  handleDeleteRange,
  handelChangeRange,
} from './actions/RangesActions';
import {
  handleHistoryUndo,
  handleHistoryRedo,
  handleHistoryReset,
} from './actions/HistoryActions';

export const initialState = {
  data: null,
  tempData: null,
  xDomain: [],
  yDomain: [],
  yDomains: {},
  originDomain: {},
  integralsYDomains: {},
  originIntegralYDomain: {},
  selectedTool: options.zoom.id,
  selectedFilter: null,
  selectedOptionPanel: null,
  activeTab: null,
  width: null,
  height: null,
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
};

export const spectrumReducer = (state, action) => {
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
      return handleResizeIntegral(state, action.integral);

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
      return zoomOut(state, action.zoomType);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);
    case APPLY_ZERO_FILLING_FILTER:
      return applyZeroFillingFilter(state, action.value);
    case APPLY_FFT_FILTER:
      return applyFFTFilter(state);
    case APPLY_MANUAL_PHASE_CORRECTION_FILTER:
      return applyManualPhaseCorrectionFilter(state, action.value);
    case CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return calculateManualPhaseCorrection(state, action.value);
    case ENABLE_FILTER:
      return enableFilter(state, action.id, action.checked);

    case DELETE_FILTER:
      return deleteFilter(state, action.id);

    case CHANGE_VISIBILITY:
      return handleSpectrumVisibility(state, action.data);

    case CHANGE_PEAKS_MARKERS_VISIBILITY:
      return handleChangePeaksMarkersVisibility(state, action.data);
    case CHANGE_ACTIVE_SPECTRUM:
      return handleChangeActiveSpectrum(state, action.data);

    case CHANGE_SPECTRUM_COLOR:
      return handleChangeSpectrumColor(state, action.data);
    case TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return handleToggleRealImaginaryVisibility(state);
    case SET_ZOOM_FACTOR:
      return handleZoom(state, action.zoomFactor);
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
      return handleChangeIntegralZoom(state, action.zoomFactor);

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
    case DELETE_RANGE:
      return handleDeleteRange(state, action.rangeID);
    case CHANGE_RANGE_DATA:
      return handelChangeRange(state, action);

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

    case RESET_DOMAIN:
      return handelResetDomain(state);
    case UNDO:
      return handleHistoryUndo(state);

    case REDO:
      return handleHistoryRedo(state);

    case RESET:
      return handleHistoryReset(state, action);

    default:
      return state;
  }
};
