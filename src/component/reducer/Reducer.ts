import { produce } from 'immer';
import { buildCorrelationData, Types } from 'nmr-correlation';
import { predictionProton } from 'nmr-processing';
import OCL from 'openchemlib/full';

import * as SpectraManager from '../../data/SpectraManager';
import { Spectra } from '../NMRium';
import { DefaultTolerance } from '../panels/SummaryPanel/CorrelationTable/Constants';
import { options } from '../toolbar/ToolTypes';
import { nmredataToNmrium } from '../utility/nmredataToNmrium';

import * as CorrelationsActions from './actions/CorrelationsActions';
import { setWidth, handleSetDimensions } from './actions/DimensionsActions';
import * as DomainActions from './actions/DomainActions';
import * as FiltersActions from './actions/FiltersActions';
import * as GlobalActions from './actions/GlobalActions';
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

export const initialState = {
  data: [],
  contours: null,
  tempData: null,
  xDomain: [],
  yDomain: [],
  yDomains: {},
  xDomains: {},
  originDomain: {},
  integralsYDomains: {},
  originIntegralYDomain: {},
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
  isLoading: false,
  preferences: {},
  keysPreferences: {},
  displayerMode: DISPLAYER_MODE.DM_1D,
  tabActiveSpectrum: {},
  spectraAnalysis: {},
  correlations: buildCorrelationData([], {
    tolerance: DefaultTolerance,
  }),
  displayerKey: '',
  ZoomHistory: {},
  overDisplayer: false,
  toolOptions: {
    selectedTool: options.zoom.id,
    selectedOptionPanel: null,
    data: {
      baseLineZones: [],
      exclusionZones: {},
      pivot: { value: 0, index: 0 },
      zonesNoiseFactor: 1,
      tempRange: null,
      showMultiplicityTrees: false,
    },
  },
};

export interface State {
  data: Spectra;
  contours: any;
  tempData: any;
  xDomain: Array<number>;
  yDomain: Array<number>;
  yDomains: any;
  xDomains: any;
  originDomain: any;
  integralsYDomains: any;
  originIntegralYDomain: any;
  activeTab: any;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  activeSpectrum: any;
  mode: string;
  zoomFactor: Partial<{ scale: number }>;
  integralZoomFactor: Partial<{ scale: number }>;
  molecules: Array<any>;
  verticalAlign: {
    flag: boolean;
    stacked: boolean;
    value: number;
  };
  history: Partial<{
    past: Array<any>;
    present: any;
    future: Array<any>;
    hasUndo: boolean;
    hasRedo: boolean;
  }>;
  isLoading: boolean;
  preferences: any;
  keysPreferences: any;
  displayerMode: DISPLAYER_MODE;
  tabActiveSpectrum: any;
  spectraAnalysis: any;
  displayerKey: any;
  correlations: Types.CorrelationData;
  ZoomHistory: any;
  overDisplayer: boolean;

  toolOptions: {
    selectedTool: string | number;
    selectedOptionPanel: any;

    data: {
      baseLineZones: any;
      exclusionZones: {
        [key: string]: Array<{ id: string; from: number; to: number }>;
      };
      pivot: { value: number; index: number };
      zonesNoiseFactor: number;
      activeFilterID?: string | number | null;
      tempRange: any;
      showMultiplicityTrees: boolean;
    };
  };
}

export function dispatchMiddleware(dispatch) {
  const usedColors = { '1d': [], '2d': [] };

  return (action) => {
    switch (action.type) {
      case types.INITIATE: {
        if (action.payload) {
          const { spectra, ...res } = action.payload;
          void SpectraManager.fromJSON(spectra, usedColors).then((data) => {
            action.payload = { spectra: data, ...res };
            dispatch(action);
          });
        } else {
          dispatch(action);
        }
        break;
      }
      case types.LOAD_JSON_FILE: {
        const data = JSON.parse(action.files[0].binary.toString());
        void SpectraManager.fromJSON(data.spectra, usedColors).then(
          (spectra) => {
            action.payload = Object.assign(data, { spectra });
            dispatch(action);
          },
        );
        break;
      }
      case types.LOAD_ZIP_FILE: {
        for (let zipFile of action.files) {
          void SpectraManager.addBruker(
            { display: { name: zipFile.name } },
            zipFile.binary,
            usedColors,
          ).then((data) => {
            action.payload = data;
            dispatch(action);
          });
        }
        break;
      }
      case types.LOAD_NMREDATA_FILE: {
        void nmredataToNmrium(action.file, usedColors).then((data) => {
          action.payload = data;
          dispatch(action);
        });
        break;
      }
      case types.PREDICT_SPECTRA: {
        const molecule = OCL.Molecule.fromMolfile(action.payload.mol.molfile);
        void predictionProton(molecule, {}).then((result) => {
          action.payload.fromMolfile = result;
          action.payload.usedColors = usedColors;
          dispatch(action);
        });

        break;
      }

      default:
        action.usedColors = usedColors;
        dispatch(action);

        break;
    }
  };
}

function innerSpectrumReducer(draft, action) {
  draft.actionType = action.type;
  switch (action.type) {
    case types.INITIATE:
      return LoadActions.initiate(draft, action);
    case types.SET_LOADING_FLAG:
      return LoadActions.setIsLoading(draft, action.isLoading);
    case types.LOAD_JSON_FILE:
      return LoadActions.handleLoadJsonFile(draft, action);
    case types.LOAD_JCAMP_FILE:
      return LoadActions.loadJcampFile(draft, action);
    case types.LOAD_JDF_FILE:
      return LoadActions.loadJDFFile(draft, action);
    case types.LOAD_MOL_FILE:
      return LoadActions.handleLoadMOLFile(draft, action);
    case types.LOAD_ZIP_FILE:
      return LoadActions.handleLoadZIPFile(draft, action);
    case types.LOAD_NMREDATA_FILE:
      return LoadActions.handleLoadNmredata(draft, action);
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
      return IntegralsActions.changeIntegral(draft, action);
    case types.CHANGE_INTEGRAL_ZOOM:
      return IntegralsActions.handleChangeIntegralZoom(draft, action);
    case types.CHANGE_INTEGRAL_SUM:
      return IntegralsActions.handleChangeIntegralSum(draft, action.value);
    case types.CHANGE_INTEGRALS_SUM_FLAG:
      return IntegralsActions.handleChangeIntegralsSumFlag(draft, action);
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
      return ToolsActions.setSelectedTool(draft, action);
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
      return FiltersActions.applyAutoPhaseCorrectionFilter(draft);
    case types.APPLY_ABSOLUTE_FILTER:
      return FiltersActions.applyAbsoluteFilter(draft);
    case types.CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return FiltersActions.calculateManualPhaseCorrection(draft, action.value);
    case types.ENABLE_FILTER:
      return FiltersActions.enableFilter(draft, action.id, action.checked);
    case types.DELETE_FILTER:
      return FiltersActions.deleteFilter(draft, action);
    case types.DELETE_SPECTRA_FILTER:
      return FiltersActions.deleteSpectraFilter(draft, action);
    case types.SET_FILTER_SNAPSHOT:
      return FiltersActions.filterSnapshotHandler(draft, action);
    case types.APPLY_MULTIPLE_SPECTRA_FILTER:
      return FiltersActions.handleMultipleSpectraFilter(draft, action);

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
    case types.SET_SPECTRA_SAME_TOP:
      return ToolsActions.setSpectraSameTopHandler(draft);
    case types.RESET_SPECTRA_SCALE:
      return ToolsActions.resetSpectraScale(draft);

    case types.CHANGE_SPECTRUM_DISPLAY_VIEW_MODE:
      return ToolsActions.handleChangeSpectrumDisplayMode(draft);

    case types.ADD_MOLECULE:
      return MoleculeActions.addMoleculeHandler(draft, action.molfile);

    case types.SET_MOLECULE:
      return MoleculeActions.setMoleculeHandler(
        draft,
        action.molfile,
        action.key,
      );

    case types.DELETE_MOLECULE:
      return MoleculeActions.deleteMoleculeHandler(draft, action);

    case types.PREDICT_SPECTRA:
      return MoleculeActions.predictSpectraFromMolculeHandler(draft, action);

    case types.SET_CORRELATIONS_MF:
      return CorrelationsActions.handleSetMF(draft, action.payload);

    case types.SET_CORRELATIONS_TOLERANCE:
      return CorrelationsActions.handleSetTolerance(draft, action.payload);

    case types.SET_CORRELATION:
      return CorrelationsActions.handleSetCorrelation(draft, action.payload);

    case types.SET_CORRELATIONS:
      return CorrelationsActions.handleSetCorrelations(draft, action.payload);

    case types.DELETE_SPECTRA:
      return SpectrumsActions.handleDeleteSpectra(draft, action);

    case types.SET_INTEGRAL_Y_DOMAIN:
      return DomainActions.handleChangeIntegralYDomain(draft, action.yDomain);

    case types.BRUSH_END:
      return ToolsActions.handleBrushEnd(draft, action);

    case types.SET_VERTICAL_INDICATOR_X_POSITION:
      return ToolsActions.setVerticalIndicatorXPosition(draft, action.position);
    case types.SET_SPECTRUMS_VERTICAL_ALIGN:
      return ToolsActions.setSpectrumsVerticalAlign(draft);

    case types.AUTO_PEAK_PICKING:
      return PeaksActions.handleAutoPeakPicking(draft, action.options);

    case types.AUTO_ZONES_DETECTION:
      return ZonesActions.handleAutoZonesDetection(draft, action.options);
    case types.CHANGE_ZONES_NOISE_FACTOR:
      return ZonesActions.changeZonesFactorHandler(draft, action);
    case types.AUTO_RANGES_DETECTION:
      return RangesActions.handleAutoRangesDetection(draft, action.options);
    case types.ADD_RANGE:
      return RangesActions.handleAddRange(draft, action);
    case types.DELETE_RANGE:
      return RangesActions.handleDeleteRange(draft, action);
    case types.RESIZE_RANGE:
      return RangesActions.handleResizeRange(draft, action);
    case types.CHANGE_RANGE_SUM:
      return RangesActions.handleChangeRangeSum(draft, action.value);
    case types.CHANGE_RANGES_SUM_FLAG:
      return RangesActions.handleChangeRangesSumFlag(draft, action);
    case types.CHANGE_RANGE_RELATIVE:
      return RangesActions.handleChangeRangeRaltiveValue(draft, action);
    case types.CHANGE_RANGE_SIGNAL_VALUE:
      return RangesActions.handleChangeRangeSignalValue(draft, action);
    case types.CHANGE_RANGE_SIGNAL_KIND:
      return RangesActions.handleChangeRangeSignalKind(draft, action);
    case types.SAVE_EDITED_RANGE:
      return RangesActions.handleSaveEditedRange(draft, action);
    case types.UNLINK_RANGE:
      return RangesActions.handleUnlinkRange(draft, action);
    case types.SET_DIAID_RANGE:
      return RangesActions.handleSetDiaIDRange(draft, action);
    case types.CHANGE_TEMP_RANGE:
      return RangesActions.handleChangeTempRange(draft, action);
    case types.SHOW_MULTIPLICTY_TREES:
      return RangesActions.handleShowMultiplicityTrees(draft);

    case types.SET_PREFERENCES:
      return handelSetPreferences(draft, action.data);
    case types.SET_ACTIVE_TAB:
      return ToolsActions.handelSetActiveTab(draft, action.tab);
    case types.ADD_BASE_LINE_ZONE:
      return ToolsActions.handleAddBaseLineZone(draft, action.zone);
    case types.DELETE_BASE_LINE_ZONE:
      return ToolsActions.handleDeleteBaseLineZone(draft, action.id);
    case types.ADD_EXCLUSION_ZONE:
      return ToolsActions.handleAddExclusionZone(draft, action);
    case types.DELETE_EXCLUSION_ZONE:
      return ToolsActions.handleDeleteExclusionZone(draft, action);

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
      return ZonesActions.handleDeleteZone(draft, action);
    case types.ADD_MISSING_PROJECTION:
      return SpectrumsActions.addMissingProjectionHander(draft, action);
    case types.RESET_DOMAIN:
      return DomainActions.handelResetDomain(draft);
    case types.CHANGE_ZONE_SIGNAL_VALUE:
      return ZonesActions.changeZoneSignalDelta(draft, action);
    case types.CHANGE_ZONE_SIGNAL_KIND:
      return ZonesActions.handleChangeZoneSignalKind(draft, action);
    case types.UNLINK_ZONE:
      return ZonesActions.handleUnlinkZone(draft, action);
    case types.SET_DIAID_ZONE:
      return ZonesActions.handleSetDiaIDZone(draft, action);

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

    case types.SET_MOUSE_OVER_DISPLAYER:
      return GlobalActions.setIsOverDisplayer(draft, action);

    default:
      return;
  }
}

export const spectrumReducer = produce(innerSpectrumReducer);
