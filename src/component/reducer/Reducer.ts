import type { BaselineCorrectionZone } from '@zakodium/nmr-types';
import type { Spectrum, ViewState } from '@zakodium/nmrium-core';
import type { Source } from 'file-collection';
import type { Draft } from 'immer';
import { original, produce } from 'immer';
import type { CorrelationData } from 'nmr-correlation';
import { buildCorrelationData } from 'nmr-correlation';
import type { Reducer } from 'react';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';
import type { UsedColors } from '../../types/UsedColors.js';
import type { Insets } from '../1d/inset/SpectraInsets.js';
import type { Action } from '../context/DispatchContext.js';
import { DefaultTolerance } from '../panels/SummaryPanel/CorrelationTable/Constants.js';
import type { Tool } from '../toolbar/ToolTypes.js';

import * as AssignmentsActions from './actions/AssignmentsActions.js';
import * as CorrelationsActions from './actions/CorrelationsActions.js';
import * as DatabaseActions from './actions/DatabaseActions.js';
import * as DimensionsActions from './actions/DimensionsActions.js';
import * as DomainActions from './actions/DomainActions.js';
import * as FiltersActions from './actions/FiltersActions.js';
import * as InsetActions from './actions/InsetActions.js';
import * as IntegralsActions from './actions/IntegralsActions.js';
import * as LoadActions from './actions/LoadActions.js';
import * as MoleculeActions from './actions/MoleculeActions.js';
import * as PeaksActions from './actions/PeaksActions.js';
import * as PreferencesActions from './actions/PreferencesActions.js';
import * as RangesActions from './actions/RangesActions.js';
import * as SpectraActions from './actions/SpectraActions.js';
import * as ToolsActions from './actions/ToolsActions.js';
import * as ZonesActions from './actions/ZonesActions.js';
import type { ZoomHistory } from './helper/ZoomHistoryManager.js';

export type DisplayerMode = '1D' | '2D';

interface Pivot {
  value: number;
  index: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type Domains = Record<string, number[]>;
export type SpectraDirection = 'RTL' | 'LTR';
export type TraceDirection = 'vertical' | 'horizontal';
export interface SpectrumTrace {
  id: string;
  x: number;
  y: number;
}

export interface PhaseCorrectionTraceData {
  spectra: SpectrumTrace[];
  ph0: number;
  ph1: number;
  pivot: Pivot | null;
  scaleRatio: number;
}

export interface TwoDimensionPhaseCorrection {
  traces: Record<TraceDirection, PhaseCorrectionTraceData>;
  activeTraceDirection: TraceDirection;
  addTracesToBothDirections: boolean;
}

export const getDefaultTwoDimensionsPhaseCorrectionTraceOptions =
  (): TwoDimensionPhaseCorrection['traces'] => {
    return {
      horizontal: {
        ph0: 0,
        ph1: 0,
        pivot: null,
        spectra: [],
        scaleRatio: 1,
      },
      vertical: {
        ph0: 0,
        ph1: 0,
        pivot: null,
        spectra: [],
        scaleRatio: 1,
      },
    };
  };

export function getDefaultViewState(): ViewState {
  return {
    molecules: {},
    ranges: {},
    zones: {},
    peaks: {},
    integrals: {},
    spectra: {
      activeSpectra: {},
      activeTab: '',
      showLegend: false,
      showSimilarityTree: false,
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
      twoDimensionPhaseCorrection: {
        activeTraceDirection: 'horizontal',
        addTracesToBothDirections: true,
        traces: getDefaultTwoDimensionsPhaseCorrectionTraceOptions(),
      },
      pivot: { value: 0, index: 0 },
      zonesNoiseFactor: 1,
      zonesMinMaxRatio: 0.03,
      activeFilterID: null,
      predictionIndex: 0,
    },
  },
  usedColors: { '1d': [], '2d': [] },
  insets: {},
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
  yDomains: Domains;
  /**
   * X axis domain per spectrum
   * value change when zooming in/out for the selected spectrum
   * @default {}
   */
  xDomains: Domains;
  /**
   * Domain for X and Y axis once it calculated and it change in one case  when we load new spectra
   * @default {}
   */
  originDomain: {
    xDomain: number[];
    yDomain: number[];
    xDomains: Domains;
    yDomains: Domains;
    shareYDomain: boolean;
  };
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
  mode: SpectraDirection;
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
      /**
       * pivot point for manual phase correction
       * @default {value:0,index:0}
       */
      pivot: Pivot;
      /**
       * Noise factor for auto zones detection
       * @default 1
       */
      twoDimensionPhaseCorrection: TwoDimensionPhaseCorrection;
      zonesNoiseFactor: number;
      zonesMinMaxRatio: number;

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
  insets: Insets;
}

export function initState(state: State): State {
  const displayerKey = crypto.randomUUID();
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
      case 'TOGGLE_INTEGRALS_VIEW_PROPERTY':
        return IntegralsActions.handleToggleIntegralsViewProperty(
          draft,
          action,
        );

      case 'SET_AXIS_DOMAIN':
        return DomainActions.handleSetAxisDomain(draft, action);
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
      case 'APPLY_APODIZATION_DIMENSION_ONE_FILTER':
        return FiltersActions.handleApplyApodizationDimensionOneFilter(
          draft,
          action,
        );
      case 'APPLY_APODIZATION_DIMENSION_TWO_FILTER':
        return FiltersActions.handleApplyApodizationDimensionTwoFilter(
          draft,
          action,
        );
      case 'CALCULATE_APODIZATION_FILTER':
        return FiltersActions.handleCalculateApodizationFilter(draft, action);
      case 'CALCULATE_APODIZATION_DIMENSION_ONE_FILTER':
        return FiltersActions.handleCalculateApodizationDimensionOneFilter(
          draft,
          action,
        );
      case 'CALCULATE_APODIZATION_DIMENSION_TWO_FILTER':
        return FiltersActions.handleCalculateApodizationDimensionTwoFilter(
          draft,
          action,
        );
      case 'APPLY_ZERO_FILLING_FILTER':
        return FiltersActions.handleApplyZeroFillingFilter(draft, action);
      case 'APPLY_ZERO_FILLING_DIMENSION_ONE_FILTER':
        return FiltersActions.handleApplyZeroFillingDimensionOneFilter(
          draft,
          action,
        );
      case 'APPLY_ZERO_FILLING_DIMENSION_TWO_FILTER':
        return FiltersActions.handleApplyZeroFillingDimensionTwoFilter(
          draft,
          action,
        );
      case 'CALCULATE_ZERO_FILLING_FILTER':
        return FiltersActions.handleCalculateZeroFillingFilter(draft, action);
      case 'CALCULATE_ZERO_FILLING_DIMENSION_ONE_FILTER':
        return FiltersActions.handleCalculateZeroFillingDimensionOneFilter(
          draft,
          action,
        );
      case 'CALCULATE_ZERO_FILLING_DIMENSION_TWO_FILTER':
        return FiltersActions.handleCalculateZeroFillingDimensionTwoFilter(
          draft,
          action,
        );
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
      case 'APPLY_EXCLUSION_ZONE':
        return FiltersActions.handleApplyExclusionZone(draft, action);
      case 'ADD_EXCLUSION_ZONE':
        return FiltersActions.handleAddExclusionZone(draft, action);
      case 'DELETE_EXCLUSION_ZONE':
        return FiltersActions.handleDeleteExclusionZone(draft, action);
      case 'ADD_PHASE_CORRECTION_TRACE':
        return FiltersActions.handleAddPhaseCorrectionTrace(draft, action);
      case 'CHANGE_PHASE_CORRECTION_DIRECTION':
        return FiltersActions.handleChangePhaseCorrectionDirection(
          draft,
          action,
        );
      case 'TOGGLE_ADD_PHASE_CORRECTION_TRACE_TO_BOTH_DIRECTIONS':
        return FiltersActions.handleToggleAddTracesToBothDirections(draft);
      case 'DELETE_PHASE_CORRECTION_TRACE':
        return FiltersActions.handleDeletePhaseCorrectionTrace(draft, action);
      case 'SET_ONE_DIMENSION_PIVOT_POINT':
        return FiltersActions.handleSetOneDimensionPhaseCorrectionPivotPoint(
          draft,
          action,
        );
      case 'SET_TWO_DIMENSION_PIVOT_POINT':
        return FiltersActions.handleSetTwoDimensionPhaseCorrectionPivotPoint(
          draft,
          action,
        );
      case 'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER':
        return FiltersActions.handleCalculateManualTwoDimensionPhaseCorrection(
          draft,
          action,
        );
      case 'APPLY_MANUAL_PHASE_CORRECTION_TOW_DIMENSION_FILTER':
        return FiltersActions.handleApplyManualTowDimensionsPhaseCorrectionFilter(
          draft,
        );
      case 'APPLY_AUTO_PHASE_CORRECTION_TOW_DIMENSION_FILTER':
        return FiltersActions.handleApplyAutoPhaseCorrectionTwoDimensionsFilter(
          draft,
        );
      case 'REORDER_FILTERS':
        return FiltersActions.handleReorderFilters(draft, action);
      case 'CHANGE_SPECTRUM_VISIBILITY':
        return SpectraActions.handleChangeSpectrumVisibilityById(draft, action);
      case 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS':
        return SpectraActions.handleChangeSpectraVisibilityByNucleus(
          draft,
          action,
        );
      case 'CHANGE_ACTIVE_SPECTRUM':
        return SpectraActions.handleChangeActiveSpectrum(draft, action);
      case 'CHANGE_SPECTRUM_SETTING':
        return SpectraActions.handleChangeSpectrumSetting(draft, action);
      case 'ALIGN_SPECTRA':
        return SpectraActions.handleAlignSpectraHandler(draft, action);
      case 'DELETE_SPECTRA':
        return SpectraActions.handleDeleteSpectra(draft, action);
      case 'ADD_MISSING_PROJECTION':
        return SpectraActions.handleAddMissingProjectionHandler(draft, action);
      case 'GENERATE_SPECTRUM_FROM_PUBLICATION_STRING':
        return SpectraActions.handleGenerateSpectrumFromPublicationStringHandler(
          draft,
          action,
        );
      case 'IMPORT_SPECTRA_META_INFO':
        return SpectraActions.handleImportSpectraMetaInfo(draft, action);
      case 'TOGGLE_SPECTRA_LEGEND':
        return SpectraActions.handleToggleSpectraLegend(draft);
      case 'RECOLOR_SPECTRA_COLOR':
        return SpectraActions.handleRecolorSpectraBasedOnDistinctValue(
          draft,
          action,
        );
      case 'SIMULATE_SPECTRUM':
        return SpectraActions.handleSimulateSpectrum(draft, action);
      case 'UPDATE_SPECTRUM_META':
        return SpectraActions.handleUpdateSpectrumMeta(draft, action);
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
      case 'SET_SPECTRA_VERTICAL_ALIGN':
        return ToolsActions.setSpectraVerticalAlign(draft);
      case 'SET_ACTIVE_TAB':
        return ToolsActions.handleSetActiveTab(draft, action);
      case 'ADD_BASE_LINE_ZONE':
        return ToolsActions.handleAddBaseLineZone(draft, action);
      case 'DELETE_BASE_LINE_ZONE':
        return ToolsActions.handleDeleteBaseLineZone(draft, action);
      case 'RESIZE_BASE_LINE_ZONE':
        return ToolsActions.handleResizeBaseLineZone(draft, action);
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
      case 'ASSIGN_RANGE':
        return RangesActions.handleAssignRange(draft, action);
      case 'UPDATE_RANGE':
        return RangesActions.handleUpdateRange(draft, action);
      case 'TOGGLE_RANGES_VIEW_PROPERTY':
        return RangesActions.handleToggleRangesViewProperty(draft, action);
      case 'AUTO_RANGES_SPECTRA_PICKING':
        return RangesActions.handleAutoSpectraRangesDetection(draft);
      case 'CUT_RANGE':
        return RangesActions.handleCutRange(draft, action);
      case 'TOGGLE_RANGES_PEAKS_DISPLAYING_MODE':
        return RangesActions.handleChangePeaksDisplayingMode(draft);
      case 'DELETE_RANGE_PEAK':
        return RangesActions.handleDeleteRangePeak(draft, action);
      case 'CHANGE_RANGE_ASSIGNMENT_LABEL':
        return RangesActions.handleChangeRangeAssignmentLabel(draft, action);
      case 'CHANGE_RANGES_VIEW_FLOATING_BOX_BOUNDING':
        return RangesActions.handleChangeRangesViewFloatingBoxBounding(
          draft,
          action,
        );

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
      case 'ASSIGN_ZONE':
        return ZonesActions.handleAssignZone(draft, action);
      case 'AUTO_ZONES_SPECTRA_PICKING':
        return ZonesActions.handleAutoSpectraZonesDetection(draft);
      case 'TOGGLE_ZONES_VIEW_PROPERTY':
        return ZonesActions.handleToggleZonesViewProperty(draft, action);
      case 'SAVE_EDITED_ZONE':
        return ZonesActions.handleSaveEditedZone(draft, action);
      case 'CHANGE_ZONE_ASSIGNMENT_LABEL':
        return ZonesActions.handleChangeZoneAssignmentLabel(draft, action);
      case 'SET_ZONE_ASSIGNMENT_LABEL_COORDINATION':
        return ZonesActions.handleSetZoneAssignmentLabelCoordination(
          draft,
          action,
        );

      case 'RESURRECTING_SPECTRUM':
        return DatabaseActions.handleResurrectSpectrum(draft, action);
      case 'TOGGLE_SIMILARITY_TREE':
        return DatabaseActions.handleToggleSimilarityTree(draft);

      case 'SET_AUTOMATIC_ASSIGNMENTS':
        return AssignmentsActions.handleSetAutomaticAssignments(draft, action);
      case 'ADD_INSET':
        return InsetActions.handleAddInset(draft, action);
      case 'DELETE_INSET': {
        return InsetActions.handleDeleteInset(draft, action);
      }
      case 'CHANGE_INSET_BOUNDING': {
        return InsetActions.handleChangeInsetBounding(draft, action);
      }
      case 'MOVE_INSET': {
        return InsetActions.handleMoveInset(draft, action);
      }
      case 'BRUSH_END_INSET': {
        return InsetActions.handleInsetBrushEnd(draft, action);
      }
      case 'SET_INSET_ZOOM': {
        return InsetActions.handleInsetZoom(draft, action);
      }
      case 'FULL_INSET_ZOOM_OUT': {
        return InsetActions.handleInsetZoomOut(draft, action);
      }
      case 'TOGGLE_INSET_RANGES_VIEW_PROPERTY': {
        return InsetActions.handleToggleInsetRangesViewProperty(draft, action);
      }
      case 'TOGGLE_INSET_INTEGRALS_VIEW_PROPERTY': {
        return InsetActions.handleToggleInsetIntegralsViewProperty(
          draft,
          action,
        );
      }
      case 'TOGGLE_INSET_PEAKS_VIEW_PROPERTY': {
        return InsetActions.handleToggleInsetPeaksViewProperty(draft, action);
      }
      case 'TOGGLE_INSET_PEAKS_DISPLAYING_MODE': {
        return InsetActions.handleToggleInsetDisplayingPeaksMode(draft, action);
      }

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

function getDebugState(draft: any) {
  const state = original(draft);
  const string = JSON.stringify(state, (key, value: any) => {
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
