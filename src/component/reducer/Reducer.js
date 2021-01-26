import { setAutoFreeze, produce } from 'immer';

import { Analysis } from '../../data/Analysis';
import { options } from '../toolbar/ToolTypes';

import checkActionType from './IgnoreActions';
import * as CorrelationsActions from './actions/CorrelationsActions';
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
import * as SpectraAanalysisActions from './actions/SpectraAanalysisAction';
import * as SpectrumsActions from './actions/SpectrumsActions';
import * as ToolsActions from './actions/ToolsActions';
import * as ZonesActions from './actions/ZonesActions';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from './core/Constants';
import { UNDO, REDO, RESET } from './types/HistoryTypes';
import * as types from './types/Types';

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
  spectraAanalysis: {},
  AnalysisObj: new Analysis(),
  displayerKey: '',
};

export function dispatchMiddleware(dispatch, AnalysisObj, onDataChange = null) {
  return (action) => {
    switch (action.type) {
      case types.LOAD_ZIP_FILE:
        AnalysisObj.fromZip(action.files).then(() => {
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

function innerSpectrumReducer(draft, action) {
  switch (action.type) {
    case types.INITIATE:
      return LoadActions.initiate(draft, action.data);
    case types.SET_LOADING_FLAG:
      return LoadActions.setIsLoading(draft, action.isLoading);
    case types.LOAD_JSON_FILE:
      return LoadActions.handleLoadJsonFile(draft, action.data);
    case types.LOAD_JCAMP_FILE:
      return LoadActions.loadJcampFile(draft, action.files);
    case types.LOAD_JDF_FILE:
      return LoadActions.loadJDFFile(draft, action.files);
    case types.LOAD_MOL_FILE:
      return LoadActions.handleLoadMOLFile(draft, action.files);
    case types.LOAD_ZIP_FILE:
      return LoadActions.handleLoadZIPFile(draft, action.files);
    case types.SET_DATA:
      return LoadActions.setData(draft, action.data);
    case types.EXPORT_DATA:
      return exportData(draft, action);
    case types.ADD_PEAK:
      return PeaksActions.addPeak(draft, action.mouseCoordinates);
    case types.ADD_PEAKS:
      return PeaksActions.addPeaks(draft, action);

    case types.DELETE_PEAK_NOTATION:
      return PeaksActions.deletePeak(draft, action.data);

    case types.ADD_INTEGRAL:
      return IntegralsActions.addIntegral(draft, action);
    case types.DELETE_INTEGRAL:
      return IntegralsActions.deleteIntegral(draft, action);
    case types.CHANGE_INTEGRAL_DATA:
      return IntegralsActions.changeIntegral(draft, action);
    case types.RESIZE_INTEGRAL:
      return IntegralsActions.handleResizeIntegral(draft, action);
    case types.CHANGE_INTEGRAL_ZOOM:
      return IntegralsActions.handleChangeIntegralZoom(draft, action);
    case types.CHANGE_INTEGRAL_SUM:
      return IntegralsActions.handleChangeIntegralSum(draft, action.value);
    case types.CHANGE_INTEGRAL_RELATIVE:
      return IntegralsActions.handleChangeIntegralsRaltiveValue(draft, action);

    case types.SET_ORIGINAL_DOMAIN:
      return DomainActions.setOriginalDomain(draft, action.domain);

    case types.SET_X_DOMAIN:
      return DomainActions.setXDomain(draft, action.xDomain);

    case types.SET_Y_DOMAIN:
      return DomainActions.setYDomain(draft, action.yDomain);

    case types.SET_WIDTH:
      return setWidth(draft, action.width);

    case types.SET_DIMENSIONS:
      return handleSetDimensions(draft, action.width, action.height);

    case types.SET_SELECTED_TOOL:
      return ToolsActions.setSelectedTool(draft, action.selectedTool);
    case types.RESET_SELECTED_TOOL:
      return ToolsActions.resetSelectedTool(draft);
    case types.SET_SELECTED_OPTIONS_PANEL:
      return ToolsActions.setSelectedOptionPanel(
        draft,
        action.selectedOptionPanel,
      );
    case types.FULL_ZOOM_OUT:
      return ToolsActions.zoomOut(draft, action);
    case types.SHIFT_SPECTRUM:
      return FiltersActions.shiftSpectrumAlongXAxis(draft, action.shiftValue);
    case types.APPLY_ZERO_FILLING_FILTER:
      return FiltersActions.applyZeroFillingFilter(draft, action.value);
    case types.APPLY_FFT_FILTER:
      return FiltersActions.applyFFTFilter(draft);
    case types.APPLY_MANUAL_PHASE_CORRECTION_FILTER:
      return FiltersActions.applyManualPhaseCorrectionFilter(
        draft,
        action.value,
      );
    case types.APPLY_AUTO_PHASE_CORRECTION_FILTER:
      return FiltersActions.applyAutoPhaseCorrectionFilter(draft, action.value);
    case types.APPLY_ABSOLUTE_FILTER:
      return FiltersActions.applyAbsoluteFilter(draft);
    case types.CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return FiltersActions.calculateManualPhaseCorrection(draft, action.value);
    case types.ENABLE_FILTER:
      return FiltersActions.enableFilter(draft, action.id, action.checked);
    case types.DELETE_FILTER:
      return FiltersActions.deleteFilter(draft, action.id);
    case types.SET_FILTER_SNAPSHOT:
      return FiltersActions.filterSnapshotHandler(draft, action);

    case types.CHANGE_VISIBILITY:
      return SpectrumsActions.handleSpectrumVisibility(draft, action);

    case types.CHANGE_PEAKS_MARKERS_VISIBILITY:
      return SpectrumsActions.handleChangePeaksMarkersVisibility(
        draft,
        action.data,
      );
    case types.CHANGE_ACTIVE_SPECTRUM:
      return SpectrumsActions.handleChangeActiveSpectrum(draft, action.data);
    case types.CHANGE_SPECTRUM_COLOR:
      return SpectrumsActions.handleChangeSpectrumColor(draft, action.data);
    case types.CHANGE_SPECTRUM_SETTING:
      return SpectrumsActions.changeSpectrumSetting(draft, action);
    case types.ALIGN_SPECTRA:
      return SpectrumsActions.alignSpectraHandler(draft, action);
    case types.TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return ToolsActions.handleToggleRealImaginaryVisibility(draft);
    case types.SET_ZOOM_FACTOR:
      return ToolsActions.handleZoom(draft, action);

    case types.CHANGE_SPECTRUM_DISPLAY_VIEW_MODE:
      return ToolsActions.handleChangeSpectrumDisplayMode(draft, action);

    case types.ADD_MOLECULE:
      return MoleculeActions.handleAddMolecule(draft, action.molfile);

    case types.SET_MOLECULE:
      return MoleculeActions.handleSetMolecule(
        draft,
        action.molfile,
        action.key,
      );

    case types.DELETE_MOLECULE:
      return MoleculeActions.handleDeleteMolecule(draft, action.key);

    case types.UPDATE_CORRELATIONS:
      return CorrelationsActions.handleUpdateCorrelations(
        draft,
        action.signals1D,
        action.signals2D,
        action.signalsDEPT,
      );

    case types.ADD_CORRELATION:
      return CorrelationsActions.handleAddCorrelation(
        draft,
        action.correlation,
      );

    case types.DELETE_CORRELATION:
      return CorrelationsActions.handleDeleteCorrelation(draft, action.id);

    case types.SET_CORRELATION:
      return CorrelationsActions.handleSetCorrelation(
        draft,
        action.id,
        action.correlation,
      );

    case types.SET_CORRELATIONS:
      return CorrelationsActions.handleSetCorrelations(
        draft,
        action.ids,
        action.correlations,
      );

    case types.SET_CORRELATION_MF:
      return CorrelationsActions.handleSetMF(draft, action.mf);

    case types.UNSET_CORRELATION_MF:
      return CorrelationsActions.handleUnsetMF(draft);

    case types.SET_CORRELATION_TOLERANCE:
      return CorrelationsActions.handleSetTolerance(draft, action.tolerance);

    case types.DELETE_SPECTRA:
      return SpectrumsActions.handleDeleteSpectra(draft, action);

    case types.SET_INTEGRAL_Y_DOMAIN:
      return DomainActions.handleChangeIntegralYDomain(draft, action.yDomain);

    case types.BRUSH_END:
      return ToolsActions.handleBrushEnd(draft, action);

    case types.SET_VERTICAL_INDICATOR_X_POSITION:
      return ToolsActions.setVerticalIndicatorXPosition(draft, action.position);
    case types.SET_SPECTRUMS_VERTICAL_ALIGN:
      return ToolsActions.setSpectrumsVerticalAlign(draft, action.flag);

    case types.AUTO_PEAK_PICKING:
      return PeaksActions.handleAutoPeakPicking(draft, action.options);

    case types.AUTO_ZONES_DETECTION:
      return ZonesActions.handleAutoZonesDetection(draft, action.options);
    case types.AUTO_RANGES_DETECTION:
      return RangesActions.handleAutoRangesDetection(draft, action.options);
    case types.ADD_RANGE:
      return RangesActions.handleAddRange(draft, action);
    case types.DELETE_RANGE:
      return RangesActions.handleDeleteRange(draft, action.rangeID);
    case types.CHANGE_RANGE_DATA:
      return RangesActions.handleChangeRange(draft, action);
    case types.RESIZE_RANGE:
      return RangesActions.handleResizeRange(draft, action);
    case types.CHANGE_RANGE_SUM:
      return RangesActions.handleChangeRangeSum(draft, action.value);
    case types.CHANGE_RANGE_RELATIVE:
      return RangesActions.handleChangeRangeRaltiveValue(draft, action);
    case types.CHANGE_RANGE_SIGNAL:
      return RangesActions.handleChangeRangeSignalValue(draft, action);

    case types.SET_PREFERENCES:
      return handelSetPreferences(draft, action.data);
    case types.SET_ACTIVE_TAB:
      return ToolsActions.handelSetActiveTab(draft, action.tab);
    case types.ADD_BASE_LINE_ZONE:
      return ToolsActions.handleAddBaseLineZone(draft, action.zone);
    case types.DELETE_BASE_LINE_ZONE:
      return ToolsActions.handleDeleteBaseLineZone(draft, action.id);
    case types.APPLY_BASE_LINE_CORRECTION_FILTER:
      return FiltersActions.handleBaseLineCorrectionFilter(draft, action);
    case types.SET_KEY_PREFERENCES:
      return setKeyPreferencesHandler(draft, action.keyCode);
    case types.APPLY_KEY_PREFERENCES:
      return applyKeyPreferencesHandler(draft, action.keyCode);
    case types.SET_2D_LEVEL:
      return ToolsActions.levelChangeHandler(draft, action);
    case types.ADD_2D_ZONE:
      return ZonesActions.add2dZoneHandler(draft, action);
    case types.DELETE_2D_ZONE:
      return ZonesActions.delete2dZoneHandler(draft, action.zoneID);
    case types.ADD_MISSING_PROJECTION:
      return SpectrumsActions.addMissingProjectionHander(draft, action);
    case types.RESET_DOMAIN:
      return DomainActions.handelResetDomain(draft);
    case types.CHANGE_ZONE_DATA:
      return ZonesActions.handleChangeZone(draft, action);
    case types.CHANGE_ZONE_SIGNAL:
      return ZonesActions.changeZoneSignal(draft, action);

    case types.ANALYZE_SPECTRA:
      return SpectraAanalysisActions.analyzeSpectra(draft, action);
    case types.DELETE_ANALYZE_SPECTRA_RANGE:
      return SpectraAanalysisActions.handleDeleteSpectraRanges(draft, action);
    case types.RESIZE_ANALYZE_SPECTRA_RANGE:
      return SpectraAanalysisActions.handleResizeSpectraRange(draft, action);
    case types.SET_ANALYZE_SPECTRA_COLUMNS:
      return SpectraAanalysisActions.handleSetcolumns(draft, action);
    case types.FILTER_SPECTRA_COLUMN:
      return SpectraAanalysisActions.handleFiltercolumn(draft, action);

    case UNDO:
      return handleHistoryUndo(draft);

    case REDO:
      return handleHistoryRedo(draft);

    case RESET:
      return handleHistoryReset(draft, action);

    default:
      return draft;
  }
}

export const spectrumReducer = produce(innerSpectrumReducer);
