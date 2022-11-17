import { v4 } from '@lukeed/uuid';
import { Draft, produce } from 'immer';
import { buildCorrelationData, CorrelationData } from 'nmr-correlation';
import { read as readDropFiles, readNMRiumObject } from 'nmr-load-save';

import { predictSpectra } from '../../data/PredictionManager';
import { SpectraAnalysis } from '../../data/data1d/MultipleAnalysis';
import { ApodizationOptions } from '../../data/data1d/filter1d/apodization';
import { ContoursLevels } from '../../data/data2d/Spectrum2D/contours';
import {
  MoleculesView,
  StateMoleculeExtended,
} from '../../data/molecules/Molecule';
import { UsedColors } from '../../types/UsedColors';
import { Spectra } from '../NMRium';
import { useChartData } from '../context/ChartContext';
import { DefaultTolerance } from '../panels/SummaryPanel/CorrelationTable/Constants';
import { options } from '../toolbar/ToolTypes';

import * as AssignmentsActions from './actions/AssignmentsActions';
import * as CorrelationsActions from './actions/CorrelationsActions';
import * as DatabaseActions from './actions/DatabaseActions';
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
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
} from './actions/PreferencesActions';
import * as RangesActions from './actions/RangesActions';
import * as SpectraAnalysisActions from './actions/SpectraAnalysisAction';
import * as SpectrumsActions from './actions/SpectrumsActions';
import * as ToolsActions from './actions/ToolsActions';
import * as ZonesActions from './actions/ZonesActions';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from './core/Constants';
import { ZoomHistory } from './helper/ZoomHistoryManager';
import { UNDO, REDO, RESET } from './types/HistoryTypes';
import * as types from './types/Types';

export interface ActiveSpectrum {
  id: string;
  index: number;
}
interface ToolStateBase {
  spectrumID: string;
}
interface RangeToolState extends ToolStateBase {
  /**
   * boolean indicator to hide/show multiplicity tree
   * @default false
   */
  showMultiplicityTrees: boolean;
  /**
   * boolean indicator to hide/show J graph for spectrum signals
   * @default false
   */
  showJGraph: boolean;
  /**
   * boolean indicator to hide/show integrals for the spectrum ranges
   * @default true
   */
  showRangesIntegrals: boolean;
}
interface ZoneToolState extends ToolStateBase {
  /**
   * boolean indicator to hide/show zones
   * @default false
   */
  showZones: boolean;
  /**
   * boolean indicator to hide/show signals for spectrum zones
   * @default false
   */
  showSignals: boolean;
  /**
   * boolean indicator to hide/show peaks for spectrum zones
   * @default true
   */
  showPeaks: boolean;
}
export interface ViewState {
  /**
   *  Molecules view properties
   * @default []
   */
  molecules: MoleculesView;
  ranges: Array<RangeToolState>;
  zones: Array<ZoneToolState>;
  spectra: {
    /**
     * active spectrum id per nucleus
     * @default {}
     */
    activeSpectra: Record<string, ActiveSpectrum | null>;
    /**
     * current select tab (nucleus)
     * @default null
     */
    activeTab: string;
  };
  zoom: {
    levels: ContoursLevels;
  };
}
export const rangeStateInit = {
  showMultiplicityTrees: false,
  showRangesIntegrals: true,
  showJGraph: false,
};
export const zoneStateInit = {
  showZones: true,
  showSignals: true,
  showPeaks: true,
};
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export const getInitialState = (): State => ({
  actionType: '',
  data: [],
  tempData: null,
  xDomain: [],
  yDomain: [],
  yDomains: {},
  xDomains: {},
  originDomain: {
    xDomain: [],
    yDomain: [],
    xDomains: {},
    yDomains: {},
    shareYDomain: false,
  },
  integralsYDomains: {},
  width: 0,
  height: 0,
  margin: {
    top: 10,
    right: 20,
    bottom: 50,
    left: 0,
  },
  mode: 'RTL',
  molecules: [],
  view: {
    molecules: {},
    ranges: [],
    zones: [],
    spectra: { activeSpectra: {}, activeTab: '' },
    zoom: {
      levels: {},
    },
  },
  verticalAlign: {
    align: 'bottom',
    verticalShift: DEFAULT_YAXIS_SHIFT_VALUE,
  },
  history: {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  },
  isLoading: false,
  keysPreferences: {},
  displayerMode: DISPLAYER_MODE.DM_1D,
  spectraAnalysis: {},
  correlations: {},
  displayerKey: '',
  zoom: {
    history: {} as ZoomHistory,
  },
  overDisplayer: false,
  toolOptions: {
    selectedTool: options.zoom.id,
    selectedOptionPanel: null,
    data: {
      baselineCorrection: {
        options: {},
        zones: [],
      },
      apodizationOptions: {} as ApodizationOptions,
      pivot: { value: 0, index: 0 },
      zonesNoiseFactor: 1,
      activeFilterID: null,
      predictionIndex: 0,
      peaksOptions: {
        showPeaksShapes: false,
        showPeaksSum: false,
      },
    },
  },
  usedColors: { '1d': [], '2d': [] },
});

export const initialState = getInitialState();

export type VerticalAlignment = 'bottom' | 'center' | 'stack';
export interface VerticalAlign {
  align: VerticalAlignment;
  verticalShift: number;
}
export interface State {
  /**
   * Last action type
   *  base on the action type we can decide to trigger or not the callback function (onDataChange)
   */
  actionType: string;
  /**
   * spectra list (1d and 2d)
   */
  data: Spectra;
  /**
   * snapshot of the spectra data once phase correction activated
   *
   */
  tempData: any;
  /**
   * X axis domain
   * value change when zooming in/out
   * @default []
   */
  xDomain: Array<number>;
  /**
   * Y axis domain
   * value change when vertical scale change for all spectra
   * @default []
   */
  yDomain: Array<number>;

  /**
   * Y axis domain per spectrum
   * value change when vertical scale change for the selected spectrum
   * @default {}
   */
  yDomains: Record<string, Array<number>>;
  /**
   * X axis domain per spectrum
   * value change when zooming in/out for the selected spectrum
   * @default {}
   */
  xDomains: Record<string, Array<number>>;
  /**
   * Domain for X and Y axis once it calculated and it change in one case  when we load new spectra
   * @default {}
   */
  originDomain: {
    xDomain: Array<number>;
    yDomain: Array<number>;
    xDomains: Record<string, Array<number>>;
    yDomains: Record<string, Array<number>>;
    shareYDomain: boolean;
  };
  /**
   * y axis domain per spectrum for integrals
   * value change when vertical scale change for the integrals
   * @default {}
   */
  integralsYDomains: Record<string, Array<number>>;

  /**
   * plot chart area width
   * @default 0
   */
  width: number;
  /**
   * plot chart area height
   * @default 0
   */
  height: number;
  /**
   * The margin Around the plot chart area
   * @default {top: 10,right: 20,bottom: 70,left: 0}
   */
  margin: Margin;
  /**
   * Scale direction
   * @default 'RTL'
   */
  mode: 'RTL' | 'LTR';
  /**
   * molecules
   * @default []
   */
  molecules: Array<StateMoleculeExtended>;
  /**
   * View related information
   * @default { floatingMolecules: [], ranges: [], zones: [] };
   */
  view: ViewState;
  /**
   * options to control spectra vertical alignment
   * @default {align: 'bottom',value: DEFAULT_YAXIS_SHIFT_VALUE}
   */
  verticalAlign: VerticalAlign;
  /**
   * @todo for undo /redo features
   */
  history: Partial<{
    past: Array<any>;
    present: any;
    future: Array<any>;
    hasUndo: boolean;
    hasRedo: boolean;
  }>;

  /**
   * hide/show main loading indicator
   * @default false
   */
  isLoading: boolean;

  /**
   * temporary snapshot of state once the user press on number from 1-9
   */
  keysPreferences: any;

  /**
   * displayer mode '1D' or '2D'
   * @default '1D'
   */
  displayerMode: DISPLAYER_MODE;

  /**
   * Multiple spectra analysis data
   */

  spectraAnalysis: SpectraAnalysis;
  /**
   * unique key identifier per Displayer instance
   */
  displayerKey: string;

  /**
   * Correlation data
   */
  correlations: CorrelationData;

  /**
   * Zoom Manager for vertical scale for spectra, integral, And undo zoom in per tab (nucleus)
   * @default  {history: {},spectra: {},integral: {}}
   */
  zoom: {
    history: ZoomHistory;
  };

  /**
   * boolean indicator to check if the mouse over the displayer or not
   * value change to true once the mouse come over the displayer and vice versa true once the mouse out of the displayer
   * @default false
   */
  overDisplayer: boolean;

  /**
   * Basic options for the tools
   */
  toolOptions: {
    /**
     * The current selected tool
     * @default `options.zoom.id`
     */
    selectedTool: string;
    /**
     * The current active options panel
     * Part of tools has an options panel for more control over the tool, once the user select the tool then the options panel will be shown in the header
     * @default null
     */
    selectedOptionPanel: string | null;

    /**
     * extra data for tools
     */
    data: {
      /**
       * list of zones for Baseline correction filter
       */
      baselineCorrection: {
        zones: any[];
        options: any;
      };
      apodizationOptions: ApodizationOptions;
      /**
       * pivot point for manual phase correction
       * @default {value:0,index:0}
       */
      pivot: { value: number; index: number };
      /**
       * Noise factor for auto zones detection
       * @default 1
       */
      zonesNoiseFactor: number;

      /**
       * The current active Filter
       * @default null
       */
      activeFilterID: string | null;

      /**
       * prediction Index
       * @default 0
       */
      predictionIndex: number;

      /**
       * boolean indicator to hide/show peaks shapes
       * @default false
       */
      peaksOptions: {
        showPeaksShapes: boolean;
        showPeaksSum: boolean;
      };
    };
  };

  usedColors: UsedColors;
}
export function useActiveSpectrum() {
  const {
    view: {
      spectra: { activeSpectra, activeTab },
    },
  } = useChartData();
  return activeSpectra[activeTab] || null;
}
export function initState(state: State): State {
  const displayerKey = v4();
  const correlations = buildCorrelationData([], {
    tolerance: DefaultTolerance,
  });

  return {
    ...state,
    correlations,
    displayerKey,
    history: {},
  };
}

export function dispatchMiddleware(dispatch) {
  let usedColors: UsedColors = { '1d': [], '2d': [] };
  return (action) => {
    switch (action.type) {
      case types.INITIATE: {
        if (action.payload) {
          usedColors = { '1d': [], '2d': [] };
          void readNMRiumObject(action.payload).then((data) => {
            action.payload = { ...data, usedColors };
            dispatch(action);
          });
        }
        break;
      }
      case types.LOAD_DROP_FILES: {
        const { fileCollection } = action;
        action.usedColors = usedColors;
        readDropFiles(fileCollection)
          .then((data) => {
            action.data = data;
            dispatch(action);
          })
          .catch((error) => {
            dispatch({ type: types.SET_LOADING_FLAG, isLoading: false });
            reportError(error);
          });
        break;
      }
      case types.PREDICT_SPECTRA: {
        const {
          mol: { molfile },
          options,
        } = action.payload;
        void predictSpectra(molfile).then(
          (data) => {
            action.payload = { data, options };
            dispatch(action);
          },
          () => {
            dispatch(action);
          },
        );

        break;
      }

      default:
        action.usedColors = usedColors;
        dispatch(action);

        break;
    }
  };
}

function innerSpectrumReducer(draft: Draft<State>, action) {
  if (
    ![types.LOAD_JSON_FILE, types.LOAD_NMREDATA_FILE, types.INITIATE].includes(
      action.type,
    )
  ) {
    draft.actionType = action.type;
  }

  switch (action.type) {
    case types.INITIATE:
      return LoadActions.initiate(draft, action);
    case types.LOAD_DROP_FILES:
      return LoadActions.loadDropFiles(draft, action);
    case types.SET_LOADING_FLAG:
      return LoadActions.setIsLoading(draft, action.isLoading);
    case types.LOAD_JSON_FILE:
      return LoadActions.handleLoadJsonFile(draft, action);
    case types.LOAD_JCAMP_FILE:
      return LoadActions.loadJcampFile(draft, action);
    case types.ADD_PEAK:
      return PeaksActions.addPeak(draft, action.mouseCoordinates);
    case types.ADD_PEAKS:
      return PeaksActions.addPeaks(draft, action);
    case types.DELETE_PEAK_NOTATION:
      return PeaksActions.deletePeak(draft, action.data);
    case types.AUTO_PEAK_PICKING:
      return PeaksActions.handleAutoPeakPicking(draft, action.options);
    case types.OPTIMIZE_PEAKS:
      return PeaksActions.handleOptimizePeaks(draft, action);
    case types.CHANGE_PEAK_SHAPE:
      return PeaksActions.changePeakShapeHandler(draft, action);
    case types.TOGGLE_PEAKS_SHAPES:
      return PeaksActions.handleShowPeaksShapes(draft, action);
    case types.ADD_INTEGRAL:
      return IntegralsActions.addIntegral(draft, action);
    case types.DELETE_INTEGRAL:
      return IntegralsActions.deleteIntegral(draft, action);
    case types.CHANGE_INTEGRAL_DATA:
      return IntegralsActions.changeIntegral(draft, action);
    case types.RESIZE_INTEGRAL:
      return IntegralsActions.changeIntegral(draft, action);
    case types.CHANGE_INTEGRAL_SUM:
      return IntegralsActions.handleChangeIntegralSum(draft, action.value);
    case types.CHANGE_INTEGRALS_SUM_FLAG:
      return IntegralsActions.handleChangeIntegralsSumFlag(draft, action);
    case types.CHANGE_INTEGRAL_RELATIVE:
      return IntegralsActions.handleChangeIntegralsRelativeValue(draft, action);

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
    case types.DISABLE_FILTER_LIVE_PREVIEW:
      return FiltersActions.handleDisableFilterLivePreview(draft, action);
    case types.SHIFT_SPECTRUM:
      return FiltersActions.shiftSpectrumAlongXAxis(draft, action.shiftValue);
    case types.APPLY_APODIZATION_FILTER:
      return FiltersActions.applyApodizationFilter(draft, action);
    case types.CALCULATE_APODIZATION_FILTER:
      return FiltersActions.calculateApodizationFilter(draft, action);
    case types.APPLY_ZERO_FILLING_FILTER:
      return FiltersActions.applyZeroFillingFilter(draft, action);
    case types.CALCULATE_ZERO_FILLING_FILTER:
      return FiltersActions.calculateZeroFillingFilter(draft, action);
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
    case types.ADD_EXCLUSION_ZONE:
      return FiltersActions.handleAddExclusionZone(draft, action);
    case types.DELETE_EXCLUSION_ZONE:
      return FiltersActions.handleDeleteExclusionZone(draft, action);
    case types.APPLY_BASE_LINE_CORRECTION_FILTER:
      return FiltersActions.handleBaseLineCorrectionFilter(draft, action);
    case types.CALCULATE_BASE_LINE_CORRECTION_FILTER:
      return FiltersActions.calculateBaseLineCorrection(draft, action);

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
    case types.DELETE_SPECTRA:
      return SpectrumsActions.handleDeleteSpectra(draft, action);
    case types.ADD_MISSING_PROJECTION:
      return SpectrumsActions.addMissingProjectionHandler(draft, action);
    case types.GENERATE_SPECTRUM_FROM_PUBLICATION_STRING:
      return SpectrumsActions.generateSpectrumFromPublicationStringHandler(
        draft,
        action,
      );

    case types.TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return ToolsActions.handleToggleRealImaginaryVisibility(draft);
    case types.SET_ZOOM:
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
      return MoleculeActions.setMoleculeHandler(draft, action);
    case types.CHANGE_MOLECULE_LABEL:
      return MoleculeActions.changeMoleculeLabel(draft, action);

    case types.DELETE_MOLECULE:
      return MoleculeActions.deleteMoleculeHandler(draft, action);

    case types.PREDICT_SPECTRA:
      return MoleculeActions.predictSpectraFromMoleculeHandler(draft, action);

    case types.FLOAT_MOLECULE_OVER_SPECTRUM:
      return MoleculeActions.floatMoleculeOverSpectrum(draft, action);

    case types.TOGGLE_MOLECULE_ATOM_NUMBER:
      return MoleculeActions.toggleMoleculeAtomsNumbers(draft, action);

    case types.CHANGE_FLOAT_MOLECULE_POSITION:
      return MoleculeActions.changeFloatMoleculePosition(draft, action);

    case types.SET_CORRELATIONS_MF:
      return CorrelationsActions.handleSetMF(draft, action.payload);

    case types.SET_CORRELATIONS_TOLERANCE:
      return CorrelationsActions.handleSetTolerance(draft, action.payload);

    case types.SET_CORRELATION:
      return CorrelationsActions.handleSetCorrelation(draft, action.payload);

    case types.SET_CORRELATIONS:
      return CorrelationsActions.handleSetCorrelations(draft, action.payload);

    case types.DELETE_CORRELATION:
      return CorrelationsActions.handleDeleteCorrelation(draft, action.payload);

    case types.BRUSH_END:
      return ToolsActions.handleBrushEnd(draft, action);

    case types.SET_VERTICAL_INDICATOR_X_POSITION:
      return ToolsActions.setVerticalIndicatorXPosition(draft, action.position);
    case types.SET_SPECTRUMS_VERTICAL_ALIGN:
      return ToolsActions.setSpectrumsVerticalAlign(draft);

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
    case types.DELETE_1D_SIGNAL:
      return RangesActions.handleDeleteSignal(draft, action);
    case types.RESIZE_RANGE:
      return RangesActions.handleResizeRange(draft, action);
    case types.CHANGE_RANGE_SUM:
      return RangesActions.handleChangeRangeSum(draft, action.value);
    case types.CHANGE_RANGES_SUM_FLAG:
      return RangesActions.handleChangeRangesSumFlag(draft, action);
    case types.CHANGE_RANGE_RELATIVE:
      return RangesActions.handleChangeRangeRelativeValue(draft, action);
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
    case types.UPDATE_RANGE:
      return RangesActions.handleUpdateRange(draft, action);
    case types.SHOW_MULTIPLICTY_TREES:
      return RangesActions.handleShowMultiplicityTrees(draft, action);
    case types.SHOW_RANGES_INTEGRALS:
      return RangesActions.handleShowRangesIntegrals(draft, action);
    case types.AUTO_RANGES_SPECTRA_PICKING:
      return RangesActions.handleAutoSpectraRangesDetection(draft);
    case types.SHOW_J_GRAPH:
      return RangesActions.handleShowJGraph(draft, action);

    case types.SET_ACTIVE_TAB:
      return ToolsActions.handelSetActiveTab(draft, action.tab);
    case types.ADD_BASE_LINE_ZONE:
      return ToolsActions.handleAddBaseLineZone(draft, action.zone);
    case types.DELETE_BASE_LINE_ZONE:
      return ToolsActions.handleDeleteBaseLineZone(draft, action.id);

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
    case types.DELETE_2D_SIGNAL:
      return ZonesActions.handleDeleteSignal(draft, action);
    case types.SET_2D_SIGNAL_PATH_LENGTH:
      return ZonesActions.handleSetSignalPathLength(draft, action);
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
    case types.AUTO_ZONES_SPECTRA_PICKING:
      return ZonesActions.handleAutoSpectraZonesDetection(draft);
    case types.SHOW_ZONES:
      return ZonesActions.handleShowZones(draft, action);
    case types.SHOW_ZONES_SIGNALS:
      return ZonesActions.handleShowSignals(draft, action);
    case types.SHOW_ZONES_PEAKS:
      return ZonesActions.handleShowPeaks(draft, action);
    case types.SAVE_EDITED_ZONE:
      return ZonesActions.handleSaveEditedZone(draft, action);

    case types.ANALYZE_SPECTRA:
      return SpectraAnalysisActions.analyzeSpectra(draft, action);
    case types.DELETE_ANALYZE_SPECTRA_RANGE:
      return SpectraAnalysisActions.handleDeleteSpectraRanges(draft, action);
    case types.RESIZE_ANALYZE_SPECTRA_RANGE:
      return SpectraAnalysisActions.handleResizeSpectraRange(draft, action);
    case types.SET_ANALYZE_SPECTRA_COLUMNS:
      return SpectraAnalysisActions.handleSetColumns(draft, action);
    case types.FILTER_SPECTRA_COLUMN:
      return SpectraAnalysisActions.handleFilterColumn(draft, action);
    case types.ORDER_MULTIPLE_SPECTRA_ANALYSIS:
      return SpectraAnalysisActions.handleOrderSpectra(draft, action);

    case types.RESURRECTING_SPECTRUM_FROM_RANGES:
      return DatabaseActions.handleResurrectSpectrumFromRanges(draft, action);
    case types.RESURRECTING_SPECTRUM_FROM_JCAMP:
      return DatabaseActions.handleResurrectSpectrumFromJcamp(draft, action);

    case types.SET_AUTOMATIC_ASSIGNMENTS:
      return AssignmentsActions.setAutomaticAssignmentsHandler(draft, action);

    case UNDO:
      return handleHistoryUndo(draft);

    case REDO:
      return handleHistoryRedo(draft);

    case RESET:
      return handleHistoryReset(draft, action);

    case types.SET_MOUSE_OVER_DISPLAYER:
      return GlobalActions.setIsOverDisplayer(draft, action);

    default:
  }
}

export const spectrumReducer = produce(innerSpectrumReducer);
