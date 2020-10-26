// import { setAutoFreeze } from 'immer';

import { options } from '../toolbar/ToolTypes';

import checkActionType from './IgnoreActions';
import { setWidth, handleSetDimensions } from './actions/DimensionsActions';
import * as DomainActions from './actions/DomainActions';
import { exportData } from './actions/ExportActions';
import * as FiltersActions from './actions/FiltersActions';
import {
  handleHistoryUndo,
  handleHistoryRedo,
  handleHistoryReset,
} from './actions/HistoryActions';
import * as IntegralsActions from './actions/IntegralsActions';
import * as LoadActions from './actions/LoadActions';
import * as MoleculeActions from './actions/MoleculeActions';
import * as PeaksActions from './actions/PeaksActions';
import {
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
} from './actions/PreferencesActions';
import * as RangesActions from './actions/RangesActions';
import * as SpectrumsActions from './actions/SpectrumsActions';
import * as ToolsActions from './actions/ToolsActions';
import * as ZonesActions from './actions/ZonesActions';
import * as SpectraAanalysisActions from './actions/SpectraAanalysisAction';
import { AnalysisObj } from './core/Analysis';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from './core/Constants';
import { UNDO, REDO, RESET } from './types/HistoryTypes';
import * as types from './types/Types';

// setAutoFreeze(false);

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
  showMultiplicityTrees: false,
  spectraAanalysis: {},
};

export function dispatchMiddleware(dispatch, onDataChange = null) {
  return (action) => {
    switch (action.type) {
      case types.LOAD_ZIP_FILE:
        LoadActions.loadZipFile(action.files).then(() => {
          dispatch(action);
          if (onDataChange && checkActionType(action.type)) {
            onDataChange(AnalysisObj.toJSON());
          }
        });
        break;

      default:
        dispatch(action);
        if (onDataChange && checkActionType(action.type)) {
          onDataChange(AnalysisObj.toJSON());
        }
        break;
    }
  };
}

export function spectrumReducer(state, action) {
  switch (action.type) {
    case types.INITIATE:
      return LoadActions.initiate(state, action.data);
    case types.SET_LOADING_FLAG:
      return LoadActions.setIsLoading(state, action.isLoading);
    case types.LOAD_JSON_FILE:
      return LoadActions.handleLoadJsonFile(state, action.data);
    case types.LOAD_JCAMP_FILE:
      return LoadActions.loadJcampFile(state, action.files);
    case types.LOAD_JDF_FILE:
      return LoadActions.loadJDFFile(state, action.files);
    case types.LOAD_MOL_FILE:
      return LoadActions.handleLoadMOLFile(state, action.files);
    case types.LOAD_ZIP_FILE:
      return LoadActions.handleLoadZIPFile(state, action.files);
    case types.SET_DATA:
      return LoadActions.setData(state, action.data);
    case types.EXPORT_DATA:
      return exportData(state, action);
    case types.ADD_PEAK:
      return PeaksActions.addPeak(state, action.mouseCoordinates);
    case types.ADD_PEAKS:
      return PeaksActions.addPeaks(state, action);

    case types.DELETE_PEAK_NOTATION:
      return PeaksActions.deletePeak(state, action.data);

    case types.ADD_INTEGRAL:
      return IntegralsActions.addIntegral(state, action);
    case types.DELETE_INTEGRAL:
      return IntegralsActions.deleteIntegral(state, action);
    case types.CHANGE_INTEGRAL_DATA:
      return IntegralsActions.changeIntegral(state, action);
    case types.RESIZE_INTEGRAL:
      return IntegralsActions.handleResizeIntegral(state, action);
    case types.CHANGE_INTEGRAL_ZOOM:
      return IntegralsActions.handleChangeIntegralZoom(state, action);
    case types.CHANGE_INTEGRAL_SUM:
      return IntegralsActions.handleChangeIntegralSum(state, action.value);
    case types.CHANGE_INTEGRAL_RELATIVE:
      return IntegralsActions.handleChangeIntegralsRaltiveValue(state, action);

    case types.SET_ORIGINAL_DOMAIN:
      return DomainActions.setOriginalDomain(state, action.domain);

    case types.SET_X_DOMAIN:
      return DomainActions.setXDomain(state, action.xDomain);

    case types.SET_Y_DOMAIN:
      return DomainActions.setYDomain(state, action.yDomain);

    case types.SET_WIDTH:
      return setWidth(state, action.width);

    case types.SET_DIMENSIONS:
      return handleSetDimensions(state, action.width, action.height);

    case types.SET_SELECTED_TOOL:
      return ToolsActions.setSelectedTool(state, action.selectedTool);
    case types.RESET_SELECTED_TOOL:
      return ToolsActions.resetSelectedTool(state);
    case types.SET_SELECTED_OPTIONS_PANEL:
      return ToolsActions.setSelectedOptionPanel(
        state,
        action.selectedOptionPanel,
      );
    case types.FULL_ZOOM_OUT:
      return ToolsActions.zoomOut(state, action);
    case types.SHIFT_SPECTRUM:
      return FiltersActions.shiftSpectrumAlongXAxis(state, action.shiftValue);
    case types.APPLY_ZERO_FILLING_FILTER:
      return FiltersActions.applyZeroFillingFilter(state, action.value);
    case types.APPLY_FFT_FILTER:
      return FiltersActions.applyFFTFilter(state);
    case types.APPLY_MANUAL_PHASE_CORRECTION_FILTER:
      return FiltersActions.applyManualPhaseCorrectionFilter(
        state,
        action.value,
      );
    case types.APPLY_AUTO_PHASE_CORRECTION_FILTER:
      return FiltersActions.applyAutoPhaseCorrectionFilter(state, action.value);
    case types.APPLY_ABSOLUTE_FILTER:
      return FiltersActions.applyAbsoluteFilter(state);
    case types.CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return FiltersActions.calculateManualPhaseCorrection(state, action.value);
    case types.ENABLE_FILTER:
      return FiltersActions.enableFilter(state, action.id, action.checked);
    case types.DELETE_FILTER:
      return FiltersActions.deleteFilter(state, action.id);
    case types.SET_FILTER_SNAPSHOT:
      return FiltersActions.filterSnapshotHandler(state, action);

    case types.CHANGE_VISIBILITY:
      return SpectrumsActions.handleSpectrumVisibility(state, action);

    case types.CHANGE_PEAKS_MARKERS_VISIBILITY:
      return SpectrumsActions.handleChangePeaksMarkersVisibility(
        state,
        action.data,
      );
    case types.CHANGE_ACTIVE_SPECTRUM:
      return SpectrumsActions.handleChangeActiveSpectrum(state, action.data);

    case types.CHANGE_SPECTRUM_COLOR:
      return SpectrumsActions.handleChangeSpectrumColor(state, action.data);
    case types.TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return ToolsActions.handleToggleRealImaginaryVisibility(state);
    case types.SET_ZOOM_FACTOR:
      return ToolsActions.handleZoom(state, action);
    // return {
    //   ...state,
    //   zoomFactor: action.zoomFactor,
    // };

    case types.CHANGE_SPECTRUM_DISPLAY_VIEW_MODE:
      return ToolsActions.handleChangeSpectrumDisplayMode(state, action);

    case types.ADD_MOLECULE:
      return MoleculeActions.handleAddMolecule(state, action.molfile);

    case types.SET_MOLECULE:
      return MoleculeActions.handleSetMolecule(
        state,
        action.molfile,
        action.key,
      );

    case types.DELETE_MOLECULE:
      return MoleculeActions.handleDeleteMolecule(state, action.key);

    case types.DELETE_SPECTRA:
      return SpectrumsActions.handleDeleteSpectra(state);

    case types.SET_INTEGRAL_Y_DOMAIN:
      return DomainActions.handleChangeIntegralYDomain(state, action.yDomain);

    case types.BRUSH_END:
      return ToolsActions.handleBrushEnd(state, action);

    case types.SET_VERTICAL_INDICATOR_X_POSITION:
      return ToolsActions.setVerticalIndicatorXPosition(state, action.position);
    case types.SET_SPECTRUMS_VERTICAL_ALIGN:
      return ToolsActions.setSpectrumsVerticalAlign(state, action.flag);

    case types.AUTO_PEAK_PICKING:
      return PeaksActions.handleAutoPeakPicking(state, action.options);

    case types.AUTO_ZONES_DETECTION:
      return ZonesActions.handleAutoZonesDetection(state, action.options);
    case types.AUTO_RANGES_DETECTION:
      return RangesActions.handleAutoRangesDetection(state, action.options);
    case types.ADD_RANGE:
      return RangesActions.handleAddRange(state, action);
    case types.DELETE_RANGE:
      return RangesActions.handleDeleteRange(state, action.rangeID);
    case types.CHANGE_RANGE_DATA:
      return RangesActions.handleChangeRange(state, action);
    case types.RESIZE_RANGE:
      return RangesActions.handleResizeRange(state, action);
    case types.CHANGE_RANGE_SUM:
      return RangesActions.handleChangeRangeSum(state, action.value);
    case types.SET_SHOW_MULTIPLICITY_TREES:
      return RangesActions.handleSetShowMultiplicityTrees(state, action);
    case types.CHANGE_RANGE_RELATIVE:
      return RangesActions.handleChangeRangeRaltiveValue(state, action);

    case types.SET_PREFERENCES:
      return handelSetPreferences(state, action.data);
    case types.SET_ACTIVE_TAB:
      return ToolsActions.handelSetActiveTab(state, action.tab);
    case types.ADD_BASE_LINE_ZONE:
      return ToolsActions.handleAddBaseLineZone(state, action.zone);
    case types.DELETE_BASE_LINE_ZONE:
      return ToolsActions.handleDeleteBaseLineZone(state, action.id);
    case types.APPLY_BASE_LINE_CORRECTION_FILTER:
      return FiltersActions.handleBaseLineCorrectionFilter(state, action);
    case types.SET_KEY_PREFERENCES:
      return setKeyPreferencesHandler(state, action.keyCode);
    case types.APPLY_KEY_PREFERENCES:
      return applyKeyPreferencesHandler(state, action.keyCode);
    case types.SET_2D_LEVEL:
      return ToolsActions.levelChangeHandler(state, action);
    case types.ADD_2D_ZONE:
      return ZonesActions.add2dZoneHandler(state, action);
    case types.DELETE_2D_ZONE:
      return ZonesActions.delete2dZoneHandler(state, action.zoneID);
    case types.ADD_MISSING_PROJECTION:
      return SpectrumsActions.addMissingProjectionHander(state, action);
    case types.RESET_DOMAIN:
      return DomainActions.handelResetDomain(state);
    case types.CHANGE_ZONE_DATA:
      return ZonesActions.handleChangeZone(state, action);
    case types.ANALYZE_SPECTRA:
      return SpectraAanalysisActions.analyzeSpectra(state, action);
    case types.DELETE_ANALYZE_SPECTRA_RANGE:
      return SpectraAanalysisActions.handleDeleteSpectraRanges(state, action);

    case UNDO:
      return handleHistoryUndo(state);

    case REDO:
      return handleHistoryRedo(state);

    case RESET:
      return handleHistoryReset(state, action);

    default:
      return state;
  }
}
