import { v4 } from '@lukeed/uuid';
import { WebSource as Source } from 'filelist-utils';
import { Draft, produce, original } from 'immer';
import { buildCorrelationData, CorrelationData } from 'nmr-correlation';
import { Spectrum, ViewState } from 'nmr-load-save';
import { ApodizationOptions, BaselineCorrectionZone } from 'nmr-processing';
import { Reducer } from 'react';

import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { UsedColors } from '../../types/UsedColors';
import { Action } from '../context/DispatchContext';
import { DefaultTolerance } from '../panels/SummaryPanel/CorrelationTable/Constants';
import { Tool } from '../toolbar/ToolTypes';

import * as AssignmentsActions from './actions/AssignmentsActions';
import * as CorrelationsActions from './actions/CorrelationsActions';
import * as DatabaseActions from './actions/DatabaseActions';
import * as DimensionsActions from './actions/DimensionsActions';
import * as DomainActions from './actions/DomainActions';
import * as FiltersActions from './actions/FiltersActions';
import * as IntegralsActions from './actions/IntegralsActions';
import * as LoadActions from './actions/LoadActions';
import * as MoleculeActions from './actions/MoleculeActions';
import * as PeaksActions from './actions/PeaksActions';
import * as PreferencesActions from './actions/PreferencesActions';
import * as RangesActions from './actions/RangesActions';
import * as SpectraAnalysisActions from './actions/SpectraAnalysisAction';
import * as SpectrumsActions from './actions/SpectrumsActions';
import * as ToolsActions from './actions/ToolsActions';
import * as ZonesActions from './actions/ZonesActions';
import { ZoomHistory } from './helper/ZoomHistoryManager';

export interface ActiveSpectrum {
  id: string;
  index: number;
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

export type DisplayerMode = '1D' | '2D';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function getDefaultViewState(): ViewState {
  return {
    molecules: {},
    ranges: [],
    zones: [],
    peaks: {},
    spectra: {
      activeSpectra: {},
      activeTab: '',
      showLegend: false,
      selectReferences: {},
    },
    zoom: {
      levels: {},
    },
    verticalAlign: {},
    predictions: {},
    currentSimulatedSpectrumKey: null,
  };
}
export const getInitialState = (): State => ({
  actionType: 'INITIALIZE_NMRIUM',
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
  view: getDefaultViewState(),
  history: {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  },
  isLoading: false,
  keysPreferences: {},
  displayerMode: '1D',
  correlations: {},
  displayerKey: '',
  zoom: {
    history: {} as ZoomHistory,
  },
  toolOptions: {
    selectedTool: 'zoom',
    selectedOptionPanel: null,
    data: {
      baselineCorrection: {
        options: {},
        zones: [],
        livePreview: true,
      },
      apodizationOptions: {} as ApodizationOptions,
      pivot: { value: 0, index: 0 },
      zonesNoiseFactor: 1,
      activeFilterID: null,
      predictionIndex: 0,
    },
  },
  usedColors: { '1d': [], '2d': [] },
});

export const initialState = getInitialState();

export type VerticalAlignment = 'bottom' | 'center' | 'stack';

export interface State {
  /**
   * Last action type
   *  base on the action type we can decide to trigger or not the callback function (onDataChange)
   */
  actionType: Action['type'];
  /**
   * web source of data
   */
  source?: Source;
  /**
   * spectra list (1d and 2d)
   */
  data: Spectrum[];
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
  xDomain: number[];
  /**
   * Y axis domain
   * value change when vertical scale change for all spectra
   * @default []
   */
  yDomain: number[];

  /**
   * Y axis domain per spectrum
   * value change when vertical scale change for the selected spectrum
   * @default {}
   */
  yDomains: Record<string, number[]>;
  /**
   * X axis domain per spectrum
   * value change when zooming in/out for the selected spectrum
   * @default {}
   */
  xDomains: Record<string, number[]>;
  /**
   * Domain for X and Y axis once it calculated and it change in one case  when we load new spectra
   * @default {}
   */
  originDomain: {
    xDomain: number[];
    yDomain: number[];
    xDomains: Record<string, number[]>;
    yDomains: Record<string, number[]>;
    shareYDomain: boolean;
  };
  /**
   * y axis domain per spectrum for integrals
   * value change when vertical scale change for the integrals
   * @default {}
   */
  integralsYDomains: Record<string, number[]>;

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
  molecules: StateMoleculeExtended[];
  /**
   * View related information
   * @default { floatingMolecules: [], ranges: [], zones: [] };
   */
  view: ViewState;
  /**
   * @todo for undo /redo features
   */
  history: Partial<{
    past: any[];
    present: any;
    future: any[];
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
  displayerMode: DisplayerMode;
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
   * Basic options for the tools
   */
  toolOptions: {
    /**
     * The current selected tool
     * @default `options.zoom.id`
     */
    selectedTool: Tool;
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
        zones: BaselineCorrectionZone[];
        options: any;
        livePreview: boolean;
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
    };
  };

  usedColors: UsedColors;

  errorAction?: any; // should be an Error
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

function innerSpectrumReducer(draft: Draft<State>, action: Action) {
  if (!['LOAD_DROP_FILES', 'INITIATE'].includes(action.type)) {
    draft.actionType = action.type;
  }

  try {
    switch (action.type) {
      case 'INITIATE':
        return LoadActions.handleInitiate(draft, action);
      case 'LOAD_DROP_FILES':
        return LoadActions.handleLoadDropFiles(draft, action);
      case 'SET_LOADING_FLAG':
        return LoadActions.handleSetIsLoading(draft, action);
      case 'ADD_PEAK':
        return PeaksActions.handleAddPeak(draft, action);
      case 'ADD_PEAKS':
        return PeaksActions.handleAddPeaks(draft, action);
      case 'DELETE_PEAK':
        return PeaksActions.handleDeletePeak(draft, action);
      case 'AUTO_PEAK_PICKING':
        return PeaksActions.handleAutoPeakPicking(draft, action);
      case 'OPTIMIZE_PEAKS':
        return PeaksActions.handleOptimizePeaks(draft, action);
      case 'CHANGE_PEAK_SHAPE':
        return PeaksActions.handleChangePeakShape(draft, action);
      case 'TOGGLE_PEAKS_VIEW_PROPERTY':
        return PeaksActions.handleTogglePeaksViewProperty(draft, action);
      case 'TOGGLE_PEAKS_DISPLAYING_MODE':
        return PeaksActions.handleChangePeaksDisplayingMode(draft);
      case 'ADD_INTEGRAL':
        return IntegralsActions.handleAddIntegral(draft, action);
      case 'DELETE_INTEGRAL':
        return IntegralsActions.handleDeleteIntegral(draft, action);
      case 'RESIZE_INTEGRAL':
      case 'CHANGE_INTEGRAL':
        return IntegralsActions.handleChangeIntegral(draft, action);
      case 'CHANGE_INTEGRAL_SUM':
        return IntegralsActions.handleChangeIntegralSum(draft, action);
      case 'CHANGE_INTEGRALS_SUM_FLAG':
        return IntegralsActions.handleChangeIntegralsSumFlag(draft);
      case 'CHANGE_INTEGRAL_RELATIVE':
        return IntegralsActions.handleChangeIntegralsRelativeValue(
          draft,
          action,
        );
      case 'CUT_INTEGRAL':
        return IntegralsActions.handleCutIntegral(draft, action);

      case 'SET_X_DOMAIN':
        return DomainActions.handleSetXDomain(draft, action);
      case 'SET_Y_DOMAIN':
        return DomainActions.handleSetYDomain(draft, action);
      case 'MOVE':
        return DomainActions.handleMoveOverXAxis(draft, action);

      case 'SET_DIMENSIONS':
        return DimensionsActions.handleSetDimensions(draft, action);

      case 'SHIFT_SPECTRUM':
        return FiltersActions.handleShiftSpectrumAlongXAxis(draft, action);
      case 'APPLY_APODIZATION_FILTER':
        return FiltersActions.handleApplyApodizationFilter(draft, action);
      case 'CALCULATE_APODIZATION_FILTER':
        return FiltersActions.handleCalculateApodizationFilter(draft, action);
      case 'APPLY_ZERO_FILLING_FILTER':
        return FiltersActions.handleApplyZeroFillingFilter(draft, action);
      case 'CALCULATE_ZERO_FILLING_FILTER':
        return FiltersActions.handleCalculateZeroFillingFilter(draft, action);
      case 'APPLY_FFT_FILTER':
        return FiltersActions.handleApplyFFTFilter(draft);
      case 'APPLY_FFT_DIMENSION_1_FILTER':
        return FiltersActions.handleApplyFFtDimension1Filter(draft);
      case 'APPLY_FFT_DIMENSION_2_FILTER':
        return FiltersActions.handleApplyFFtDimension2Filter(draft);
      case 'APPLY_MANUAL_PHASE_CORRECTION_FILTER':
        return FiltersActions.handleApplyManualPhaseCorrectionFilter(
          draft,
          action,
        );
      case 'CALCULATE_MANUAL_PHASE_CORRECTION_FILTER':
        return FiltersActions.handleCalculateManualPhaseCorrection(
          draft,
          action,
        );
      case 'APPLY_AUTO_PHASE_CORRECTION_FILTER':
        return FiltersActions.handleApplyAutoPhaseCorrectionFilter(draft);
      case 'APPLY_ABSOLUTE_FILTER':
        return FiltersActions.handleApplyAbsoluteFilter(draft);
      case 'APPLY_BASE_LINE_CORRECTION_FILTER':
        return FiltersActions.handleBaseLineCorrectionFilter(draft, action);
      case 'CALCULATE_BASE_LINE_CORRECTION_FILTER':
        return FiltersActions.handleCalculateBaseLineCorrection(draft, action);
      case 'ENABLE_FILTER':
        return FiltersActions.handleEnableFilter(draft, action);
      case 'DELETE_FILTER':
        return FiltersActions.handleDeleteFilter(draft, action);
      case 'DELETE_SPECTRA_FILTER':
        return FiltersActions.handleDeleteSpectraFilter(draft, action);
      case 'SET_FILTER_SNAPSHOT':
        return FiltersActions.handleSetFilterSnapshotHandler(draft, action);
      case 'APPLY_SIGNAL_PROCESSING_FILTER':
        return FiltersActions.handleSignalProcessingFilter(draft, action);
      case 'ADD_EXCLUSION_ZONE':
        return FiltersActions.handleAddExclusionZone(draft, action);
      case 'DELETE_EXCLUSION_ZONE':
        return FiltersActions.handleDeleteExclusionZone(draft, action);
      case 'CHANGE_SPECTRUM_VISIBILITY':
        return SpectrumsActions.handleChangeSpectrumVisibilityById(
          draft,
          action,
        );
      case 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS':
        return SpectrumsActions.handleChangeSpectraVisibilityByNucleus(
          draft,
          action,
        );
      case 'CHANGE_ACTIVE_SPECTRUM':
        return SpectrumsActions.handleChangeActiveSpectrum(draft, action);
      case 'CHANGE_SPECTRUM_SETTING':
        return SpectrumsActions.handleChangeSpectrumSetting(draft, action);
      case 'ALIGN_SPECTRA':
        return SpectrumsActions.handleAlignSpectraHandler(draft, action);
      case 'DELETE_SPECTRA':
        return SpectrumsActions.handleDeleteSpectra(draft, action);
      case 'ADD_MISSING_PROJECTION':
        return SpectrumsActions.handleAddMissingProjectionHandler(
          draft,
          action,
        );
      case 'GENERATE_SPECTRUM_FROM_PUBLICATION_STRING':
        return SpectrumsActions.handleGenerateSpectrumFromPublicationStringHandler(
          draft,
          action,
        );
      case 'IMPORT_SPECTRA_META_INFO':
        return SpectrumsActions.handleImportSpectraMetaInfo(draft, action);
      case 'TOGGLE_SPECTRA_LEGEND':
        return SpectrumsActions.handleToggleSpectraLegend(draft);
      case 'RECOLOR_SPECTRA_COLOR':
        return SpectrumsActions.handleRecolorSpectraBasedOnDistinctValue(
          draft,
          action,
        );
      case 'ORDER_SPECTRA':
        return SpectrumsActions.handleOrderSpectra(draft, action);
      case 'SIMULATE_SPECTRUM':
        return SpectrumsActions.handleSimulateSpectrum(draft, action);

      case 'SET_SELECTED_TOOL':
        return ToolsActions.setSelectedTool(draft, action);
      case 'RESET_SELECTED_TOOL':
        return ToolsActions.handleResetSelectedTool(draft);
      case 'FULL_ZOOM_OUT':
        return ToolsActions.zoomOut(draft, action);
      case 'TOGGLE_REAL_IMAGINARY_VISIBILITY':
        return ToolsActions.handleToggleRealImaginaryVisibility(draft);
      case 'SET_ZOOM':
        return ToolsActions.handleZoom(draft, action);
      case 'SET_SPECTRA_SAME_TOP':
        return ToolsActions.setSpectraSameTopHandler(draft);
      case 'RESET_SPECTRA_SCALE':
        return ToolsActions.resetSpectraScale(draft);

      case 'CHANGE_SPECTRUM_DISPLAY_VIEW_MODE':
        return ToolsActions.handleChangeSpectrumDisplayMode(draft);
      case 'BRUSH_END':
        return ToolsActions.handleBrushEnd(draft, action);

      case 'SET_VERTICAL_INDICATOR_X_POSITION':
        return ToolsActions.setVerticalIndicatorXPosition(draft, action);
      case 'SET_SPECTRUMS_VERTICAL_ALIGN':
        return ToolsActions.setSpectrumsVerticalAlign(draft);
      case 'SET_ACTIVE_TAB':
        return ToolsActions.handelSetActiveTab(draft, action);
      case 'ADD_BASE_LINE_ZONE':
        return ToolsActions.handleAddBaseLineZone(draft, action);
      case 'DELETE_BASE_LINE_ZONE':
        return ToolsActions.handleDeleteBaseLineZone(draft, action);
      case 'SET_2D_LEVEL':
        return ToolsActions.levelChangeHandler(draft, action);

      case 'ADD_MOLECULE':
        return MoleculeActions.handleAddMolecule(draft, action);
      case 'ADD_MOLECULES':
        return MoleculeActions.handleAddMolecules(draft, action);
      case 'SET_MOLECULE':
        return MoleculeActions.handleSetMolecule(draft, action);
      case 'CHANGE_MOLECULE_LABEL':
        return MoleculeActions.handleChangeMoleculeLabel(draft, action);
      case 'DELETE_MOLECULE':
        return MoleculeActions.handleDeleteMolecule(draft, action);
      case 'PREDICT_SPECTRA':
        return MoleculeActions.handlePredictSpectraFromMolecule(draft, action);
      case 'FLOAT_MOLECULE_OVER_SPECTRUM':
        return MoleculeActions.handleFloatMoleculeOverSpectrum(draft, action);
      case 'TOGGLE_MOLECULE_ATOM_NUMBER':
        return MoleculeActions.handleToggleMoleculeAtomsNumbers(draft, action);
      case 'CHANGE_FLOAT_MOLECULE_POSITION':
        return MoleculeActions.handleChangeFloatMoleculePosition(draft, action);

      case 'SET_CORRELATIONS_MF':
        return CorrelationsActions.handleSetMF(draft, action);
      case 'SET_CORRELATIONS_TOLERANCE':
        return CorrelationsActions.handleSetTolerance(draft, action);
      case 'SET_CORRELATION':
        return CorrelationsActions.handleSetCorrelation(draft, action);
      case 'SET_CORRELATIONS':
        return CorrelationsActions.handleSetCorrelations(draft, action);
      case 'DELETE_CORRELATION':
        return CorrelationsActions.handleDeleteCorrelation(draft, action);

      case 'AUTO_RANGES_DETECTION':
        return RangesActions.handleAutoRangesDetection(draft, action);
      case 'ADD_RANGE':
        return RangesActions.handleAddRange(draft, action);
      case 'DELETE_RANGE':
        return RangesActions.handleDeleteRange(draft, action);
      case 'DELETE_1D_SIGNAL':
        return RangesActions.handleDeleteSignal(draft, action);
      case 'RESIZE_RANGE':
        return RangesActions.handleResizeRange(draft, action);
      case 'CHANGE_RANGE_SUM':
        return RangesActions.handleChangeRangeSum(draft, action);
      case 'CHANGE_RANGES_SUM_FLAG':
        return RangesActions.handleChangeRangesSumFlag(draft);
      case 'CHANGE_RANGE_RELATIVE':
        return RangesActions.handleChangeRangeRelativeValue(draft, action);
      case 'CHANGE_RANGE_SIGNAL_VALUE':
        return RangesActions.handleChangeRangeSignalValue(draft, action);
      case 'CHANGE_RANGE_SIGNAL_KIND':
        return RangesActions.handleChangeRangeSignalKind(draft, action);
      case 'SAVE_EDITED_RANGE':
        return RangesActions.handleSaveEditedRange(draft, action);
      case 'UNLINK_RANGE':
        return RangesActions.handleUnlinkRange(draft, action);
      case 'SET_DIAID_RANGE':
        return RangesActions.handleSetDiaIDRange(draft, action);
      case 'UPDATE_RANGE':
        return RangesActions.handleUpdateRange(draft, action);
      case 'SHOW_MULTIPLICITY_TREES':
        return RangesActions.handleShowMultiplicityTrees(draft, action);
      case 'SHOW_RANGES_INTEGRALS':
        return RangesActions.handleShowRangesIntegrals(draft, action);
      case 'AUTO_RANGES_SPECTRA_PICKING':
        return RangesActions.handleAutoSpectraRangesDetection(draft);
      case 'SHOW_J_GRAPH':
        return RangesActions.handleShowJGraph(draft, action);
      case 'CUT_RANGE':
        return RangesActions.handleCutRange(draft, action);

      case 'SET_KEY_PREFERENCES':
        return PreferencesActions.handleSetKeyPreferences(draft, action);
      case 'APPLY_KEY_PREFERENCES':
        return PreferencesActions.handleApplyKeyPreferences(draft, action);

      case 'AUTO_ZONES_DETECTION':
        return ZonesActions.handleAutoZonesDetection(draft, action);
      case 'CHANGE_ZONES_NOISE_FACTOR':
        return ZonesActions.handleChangeZonesFactor(draft, action);
      case 'ADD_2D_ZONE':
        return ZonesActions.handleAdd2dZone(draft, action);
      case 'DELETE_2D_ZONE':
        return ZonesActions.handleDeleteZone(draft, action);
      case 'DELETE_2D_SIGNAL':
        return ZonesActions.handleDeleteSignal(draft, action);
      case 'SET_2D_SIGNAL_PATH_LENGTH':
        return ZonesActions.handleSetSignalPathLength(draft, action);
      case 'CHANGE_ZONE_SIGNAL_VALUE':
        return ZonesActions.handleChangeZoneSignalDelta(draft, action);
      case 'CHANGE_ZONE_SIGNAL_KIND':
        return ZonesActions.handleChangeZoneSignalKind(draft, action);
      case 'UNLINK_ZONE':
        return ZonesActions.handleUnlinkZone(draft, action);
      case 'SET_ZONE_DIAID':
        return ZonesActions.handleSetDiaIDZone(draft, action);
      case 'AUTO_ZONES_SPECTRA_PICKING':
        return ZonesActions.handleAutoSpectraZonesDetection(draft);
      case 'SHOW_ZONES':
        return ZonesActions.handleShowZones(draft, action);
      case 'SHOW_ZONES_SIGNALS':
        return ZonesActions.handleShowSignals(draft, action);
      case 'SHOW_ZONES_PEAKS':
        return ZonesActions.handleShowPeaks(draft, action);
      case 'SAVE_EDITED_ZONE':
        return ZonesActions.handleSaveEditedZone(draft, action);

      case 'ORDER_MULTIPLE_SPECTRA_ANALYSIS':
        return SpectraAnalysisActions.handleOrderSpectra(draft, action);

      case 'RESURRECTING_SPECTRUM_FROM_RANGES':
        return DatabaseActions.handleResurrectSpectrumFromRanges(draft, action);
      case 'RESURRECTING_SPECTRUM_FROM_JCAMP':
        return DatabaseActions.handleResurrectSpectrumFromJcamp(draft, action);

      case 'SET_AUTOMATIC_ASSIGNMENTS':
        return AssignmentsActions.handleSetAutomaticAssignments(draft, action);

      case 'SECRET_THROW_ERROR': {
        throw new Error('Error thrown in main reducer');
      }

      default:
    }
  } catch (error: any) {
    draft.errorAction = error;
    error.data = { action, state: getDebugState(draft) };
    reportError(error);
  }
}

export const spectrumReducer: Reducer<State, Action> =
  produce(innerSpectrumReducer);

function getDebugState(draft) {
  const state = original(draft);
  const string = JSON.stringify(state, (key, value) => {
    if (ArrayBuffer.isView(value)) {
      return Array.from(value as any).slice(0, 20);
    }
    if (Array.isArray(value) && typeof value[0] === 'number') {
      return value.slice(0, 20);
    }
    return value;
  });
  if (string.length > 800000) {
    // fallback, better to have something as a string t han nothing
    return string.slice(0, 800000);
  }
  return JSON.parse(string);
}
