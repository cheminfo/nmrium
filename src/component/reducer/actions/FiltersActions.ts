import type {
  Apodization1DOptions,
  BaselineCorrectionOptions,
  Filter1DEntry,
  Filter1DOptions,
  Filter2DEntry,
  Filter2DOptions,
  MatrixOptions,
} from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum2D, Spectrum } from '@zakodium/nmrium-core';
import type { NmrData1D, NmrData2DFt } from 'cheminfo-types';
import type { Draft } from 'immer';
import { current } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';
import type { Filter1D, FilterDomainUpdateRules } from 'nmr-processing';
import {
  Filters1D,
  Filters1DManager,
  Filters2D,
  Filters2DManager,
  getBaselineZonesByDietrich,
} from 'nmr-processing';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { isFid1DSpectrum } from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { getDefaultContoursLevel } from '../../../data/data2d/Spectrum2D/contours.js';
import { getProjection } from '../../../data/data2d/Spectrum2D/getMissingProjection.js';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/index.js';
import {
  isFid2DSpectrum,
  isFt2DSpectrum,
} from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import type { ExclusionZone } from '../../../data/types/data1d/ExclusionZone.js';
import { getXScale } from '../../1d/utilities/scale.js';
import { get2DXScale, get2DYScale } from '../../2d/utilities/scale.js';
import { nonRemovableFilters } from '../../panels/filtersPanel/Filters/FiltersSectionsPanel.js';
import type { Tool } from '../../toolbar/ToolTypes.js';
import { options as Tools } from '../../toolbar/ToolTypes.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import nucleusToString from '../../utility/nucleusToString.js';
import type {
  PhaseCorrectionTraceData,
  State,
  TraceDirection,
  TwoDimensionPhaseCorrection,
} from '../Reducer.js';
import {
  getDefaultTwoDimensionsPhaseCorrectionTraceOptions,
  getInitialState,
} from '../Reducer.js';
import zoomHistoryManager from '../helper/ZoomHistoryManager.js';
import { findStrongestPeak } from '../helper/findStrongestPeak.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import getRange from '../helper/getRange.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import { getTwoDimensionPhaseCorrectionOptions } from '../helper/getTwoDimensionPhaseCorrectionOptions.js';
import type { ActionType } from '../types/ActionType.js';

import { get2DDomain, setDomain, setMode } from './DomainActions.js';
import { changeSpectrumVerticalAlignment } from './PreferencesActions.js';
import { activateTool, resetSelectedTool } from './ToolsActions.js';

const {
  fft,
  apodization,
  baselineCorrection,
  phaseCorrection,
  zeroFilling,
  shiftX,

  exclusionZones,
  signalProcessing,
  digitalFilter,
} = Filters1D;

const {
  fftDimension1,
  fftDimension2,
  phaseCorrectionTwoDimensions,
  shift2DX,
  shift2DY,
  digitalFilter2D,
} = Filters2D;
interface ShiftOneDimension {
  shift: number;
}
interface ShiftTwoDimensions {
  shiftX?: number;
  shiftY?: number;
}

type ShiftSpectrumOptions = ShiftOneDimension | ShiftTwoDimensions;

type ShiftSpectrumAction = ActionType<'SHIFT_SPECTRUM', ShiftSpectrumOptions>;
type ApodizationFilterAction = ActionType<
  'APPLY_APODIZATION_FILTER',
  { options: Apodization1DOptions }
>;
type ApodizationDimensionOneFilterAction = ActionType<
  'APPLY_APODIZATION_DIMENSION_ONE_FILTER',
  { options: Apodization1DOptions }
>;
type ApodizationDimensionTwoFilterAction = ActionType<
  'APPLY_APODIZATION_DIMENSION_TWO_FILTER',
  { options: Apodization1DOptions }
>;
type ApodizationFilterLiveAction = ActionType<
  'CALCULATE_APODIZATION_FILTER',
  {
    options: Apodization1DOptions;
    livePreview: boolean;
    tempRollback?: boolean;
  }
>;
type ApodizationDimensionOneFilterLiveAction = ActionType<
  'CALCULATE_APODIZATION_DIMENSION_ONE_FILTER',
  { options: Apodization1DOptions; livePreview: boolean }
>;
type ApodizationDimensionTwoFilterLiveAction = ActionType<
  'CALCULATE_APODIZATION_DIMENSION_TWO_FILTER',
  { options: Apodization1DOptions; livePreview: boolean }
>;
interface ZeroFillingOptions {
  nbPoints: number;
}
type ZeroFillingFilterAction = ActionType<
  'APPLY_ZERO_FILLING_FILTER',
  { options: ZeroFillingOptions }
>;
type ZeroFillingDimensionOneFilterAction = ActionType<
  'APPLY_ZERO_FILLING_DIMENSION_ONE_FILTER',
  { options: ZeroFillingOptions }
>;
type ZeroFillingDimensionTwoFilterAction = ActionType<
  'APPLY_ZERO_FILLING_DIMENSION_TWO_FILTER',
  { options: ZeroFillingOptions }
>;
type ZeroFillingFilterLiveAction = ActionType<
  'CALCULATE_ZERO_FILLING_FILTER',
  { options: ZeroFillingOptions; livePreview: boolean }
>;
type ZeroFillingDimensionOneFilterLiveAction = ActionType<
  'CALCULATE_ZERO_FILLING_DIMENSION_ONE_FILTER',
  { options: ZeroFillingOptions; livePreview: boolean }
>;
type ZeroFillingDimensionTwoFilterLiveAction = ActionType<
  'CALCULATE_ZERO_FILLING_DIMENSION_TWO_FILTER',
  { options: ZeroFillingOptions; livePreview: boolean }
>;
type ManualPhaseCorrectionFilterAction = ActionType<
  | 'APPLY_MANUAL_PHASE_CORRECTION_FILTER'
  | 'CALCULATE_MANUAL_PHASE_CORRECTION_FILTER',
  { ph0: number; ph1: number }
>;
type ManualTwoDimensionsPhaseCorrectionFilterAction = ActionType<
  'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER',
  { ph0: number; ph1: number; applyOn2D?: boolean }
>;

type BaselineCorrectionFilterOptions = Omit<BaselineCorrectionOptions, 'zones'>;
interface BaselineCorrectionFilterProps {
  options: BaselineCorrectionFilterOptions;
  livePreview: boolean;
}

type BaselineCorrectionFilterAction = ActionType<
  'APPLY_BASE_LINE_CORRECTION_FILTER',
  { options: BaselineCorrectionFilterOptions }
>;
type BaselineCorrectionFilterLiveAction = ActionType<
  'CALCULATE_BASE_LINE_CORRECTION_FILTER',
  BaselineCorrectionFilterProps
>;
type EnableFilterAction = ActionType<
  'ENABLE_FILTER',
  { id: string; enabled: boolean }
>;
type DeleteFilterAction = ActionType<'DELETE_FILTER', { id?: string }>;
type DeleteSpectraFilterAction = ActionType<
  'DELETE_SPECTRA_FILTER',
  { filterName: string }
>;
type SetFilterSnapshotAction = ActionType<
  'SET_FILTER_SNAPSHOT',
  {
    filter: { name: string; id: string };
    tempRollback: boolean;
    triggerSource?: 'none' | 'processedToggle';
  }
>;
type ExclusionZoneFilterAction = ActionType<
  'APPLY_EXCLUSION_ZONE',
  { zones: ExclusionZone[] }
>;
type AddExclusionZoneAction = ActionType<
  'ADD_EXCLUSION_ZONE',
  { startX: number; endX: number }
>;
type DeleteExclusionZoneAction = ActionType<
  'DELETE_EXCLUSION_ZONE',
  { zone: ExclusionZone; spectrumId?: string }
>;
type ApplySignalProcessingAction = ActionType<
  'APPLY_SIGNAL_PROCESSING_FILTER',
  { options: MatrixOptions<object> }
>;
type AddPhaseCorrectionTraceAction = ActionType<
  'ADD_PHASE_CORRECTION_TRACE',
  { x: number; y: number }
>;
type ChangePhaseCorrectionDirectionAction = ActionType<
  'CHANGE_PHASE_CORRECTION_DIRECTION',
  { direction: TraceDirection }
>;
type DeletePhaseCorrectionTrace = ActionType<
  'DELETE_PHASE_CORRECTION_TRACE',
  { id: string }
>;
type ReorderFiltersAction = ActionType<
  'REORDER_FILTERS',
  { sourceId: string; targetId: string }
>;

type SetOneDimensionPhaseCorrectionPivotPoint = ActionType<
  'SET_ONE_DIMENSION_PIVOT_POINT',
  { value: number }
>;
type SetTwoDimensionPhaseCorrectionPivotPoint = ActionType<
  'SET_TWO_DIMENSION_PIVOT_POINT',
  { x: number; y: number }
>;

export type FiltersActions =
  | ShiftSpectrumAction
  | ApodizationFilterAction
  | ApodizationDimensionOneFilterAction
  | ApodizationDimensionTwoFilterAction
  | ApodizationFilterLiveAction
  | ApodizationDimensionOneFilterLiveAction
  | ApodizationDimensionTwoFilterLiveAction
  | ZeroFillingFilterAction
  | ZeroFillingDimensionOneFilterAction
  | ZeroFillingDimensionTwoFilterAction
  | ZeroFillingFilterLiveAction
  | ZeroFillingDimensionOneFilterLiveAction
  | ZeroFillingDimensionTwoFilterLiveAction
  | ManualPhaseCorrectionFilterAction
  | BaselineCorrectionFilterAction
  | BaselineCorrectionFilterLiveAction
  | EnableFilterAction
  | DeleteFilterAction
  | DeleteSpectraFilterAction
  | SetFilterSnapshotAction
  | ExclusionZoneFilterAction
  | AddExclusionZoneAction
  | DeleteExclusionZoneAction
  | ApplySignalProcessingAction
  | AddPhaseCorrectionTraceAction
  | ChangePhaseCorrectionDirectionAction
  | DeletePhaseCorrectionTrace
  | SetOneDimensionPhaseCorrectionPivotPoint
  | SetTwoDimensionPhaseCorrectionPivotPoint
  | ManualTwoDimensionsPhaseCorrectionFilterAction
  | ReorderFiltersAction
  | ActionType<
      | 'APPLY_FFT_FILTER'
      | 'APPLY_FFT_DIMENSION_1_FILTER'
      | 'APPLY_FFT_DIMENSION_2_FILTER'
      | 'APPLY_AUTO_PHASE_CORRECTION_FILTER'
      | 'APPLY_ABSOLUTE_FILTER'
      | 'APPLY_MANUAL_PHASE_CORRECTION_TOW_DIMENSION_FILTER'
      | 'TOGGLE_ADD_PHASE_CORRECTION_TRACE_TO_BOTH_DIRECTIONS'
      | 'APPLY_AUTO_PHASE_CORRECTION_TOW_DIMENSION_FILTER'
    >;

const DEFAULT_FILTER_DOMAIN_UPDATE_RULES: FilterDomainUpdateRules = {
  updateXDomain: false,
  updateYDomain: false,
};

function getFilterUpdateDomainRules(
  filterName: string,
  defaultRule: FilterDomainUpdateRules = DEFAULT_FILTER_DOMAIN_UPDATE_RULES,
) {
  const filterDomainUpdateRules =
    Filters1D?.[filterName]?.domainUpdateRules ??
    Filters2D?.[filterName]?.domainUpdateRules;

  return filterDomainUpdateRules || defaultRule;
}

interface SpectrumByObjectOptions {
  target?: 'current';
  spectrum: Spectrum | null;
}

interface ActiveSpectrumOptions {
  target: 'active';
}

interface SpectrumByIndexOptions {
  target?: 'index';
  index: number;
}

interface SpectrumByIdOptions {
  target?: 'id';
  id: string;
}

type SpectrumOptions =
  | SpectrumByObjectOptions
  | ActiveSpectrumOptions
  | SpectrumByIndexOptions
  | SpectrumByIdOptions;

function findSpectrum(
  draft: Draft<State> | State,
  options: SpectrumOptions,
): { index: number; spectrum: Spectrum } | null {
  const { target } = options;
  const spectra = current(draft).data;
  if (target === 'active') {
    const activeSpectrum = getActiveSpectrum(draft);

    if (!activeSpectrum) return null;
    const { index } = activeSpectrum;
    return { index, spectrum: structuredClone(spectra[index]) };
  }

  if (target === 'current') {
    const { spectrum } = options;

    if (!spectrum) return null;

    const index = spectra.findIndex((datum) => datum.id === spectrum.id);
    return { index, spectrum: structuredClone(spectrum) };
  }

  if (target === 'id') {
    const { id } = options;
    const index = spectra.findIndex((spectrum) => spectrum.id === id);

    if (index === -1) return null;

    return { index, spectrum: structuredClone(spectra[index]) };
  }
  if (target === 'index') {
    const { index } = options;
    const spectrum = spectra?.[index];
    if (spectrum) return null;

    return { index, spectrum: structuredClone(spectrum) };
  }

  return null;
}

interface RollbackSpectrumByFilterOptions {
  applyFilter?: boolean;
  reset?: boolean;
  searchBy?: 'id' | 'name';
  key?: string | null;
  targetSpectrum?: SpectrumOptions;
  tempRollback?: boolean;
}

function getFilterDomain(
  datum: Spectrum,
  options: { startIndex: number; lastIndex: number },
) {
  const { startIndex, lastIndex } = options;
  const updateDomainOptions: FilterDomainUpdateRules = {
    updateXDomain: false,
    updateYDomain: false,
  };

  if (datum?.filters?.length === 0) return updateDomainOptions;

  for (let i = startIndex; i <= lastIndex; i++) {
    const { updateXDomain, updateYDomain } = getFilterUpdateDomainRules(
      datum.filters[i].name,
    );
    if (!updateDomainOptions.updateXDomain) {
      updateDomainOptions.updateXDomain = updateXDomain;
    }
    if (!updateDomainOptions.updateYDomain) {
      updateDomainOptions.updateYDomain = updateYDomain;
    }
  }
  return updateDomainOptions;
}

function reapplyFilters(
  spectrum: Spectrum,
  inputFilters?: Array<Filter1DOptions | Filter2DOptions>,
) {
  if (isSpectrum1D(spectrum)) {
    const filters = inputFilters as Filter1DOptions[];
    Filters1DManager.reapplyFilters(spectrum, { filters });
  } else {
    const filters = inputFilters as Filter2DOptions[];
    Filters2DManager.reapplyFilters(spectrum, { filters });
  }
}
function executeFilter(
  spectrum: Spectrum,
  filter: Filter1DOptions | Filter2DOptions,
) {
  const { name, value } = filter;
  if (isSpectrum1D(spectrum)) {
    Filters1D[name].apply(spectrum, value);
  } else {
    Filters2D[name].apply(spectrum, value);
  }
}

function rollbackSpectrumByFilter(
  draft: Draft<State>,
  options?: RollbackSpectrumByFilterOptions,
) {
  const {
    applyFilter = true,
    searchBy = 'id',
    reset = false,
    key,
    targetSpectrum = { target: 'active' },
    tempRollback,
  } = options || {};

  const currentSpectrum = findSpectrum(draft, targetSpectrum);

  let updateDomainOptions: Partial<FilterDomainUpdateRules> = {
    updateXDomain: false,
    updateYDomain: false,
  };
  let previousIsFid = false;
  let currentIsFid = false;
  const toolData = draft.toolOptions.data;
  if (currentSpectrum) {
    const { index } = currentSpectrum;
    let { spectrum } = currentSpectrum;
    previousIsFid = isFid1DSpectrum(spectrum) || isFid2DSpectrum(spectrum);
    const filterIndex = spectrum.filters.findIndex((f) => f[searchBy] === key);
    if (filterIndex === -1 || reset) {
      if (draft.tempData) {
        reapplyFilters(spectrum);
      }
      //if the filter is not exists, create a clone of the current data
      draft.tempData = structuredClone(current(draft).data);
      draft.tempData[index] = spectrum;
      spectrum = structuredClone(spectrum);

      if (tempRollback) {
        reapplyFilters(spectrum);
      }
      draft.data[index] = spectrum;
    }

    if (filterIndex !== -1 && !reset) {
      const activeFilterIndex = toolData.activeFilterID
        ? spectrum.filters.findIndex((f) => f.id === toolData.activeFilterID)
        : spectrum.filters.length - 1;
      //set active filter
      toolData.activeFilterID = spectrum.filters?.[filterIndex]?.id || null;

      const filters: any[] = spectrum.filters.slice(0, filterIndex);

      updateDomainOptions = getFilterDomain(spectrum, {
        startIndex: Math.min(activeFilterIndex, filterIndex),
        lastIndex: Math.max(activeFilterIndex, filterIndex),
      });

      reapplyFilters(spectrum, filters);

      draft.tempData = current(draft).data.slice();
      draft.tempData[index] = structuredClone(spectrum);

      // apply the current Filters
      if (applyFilter) {
        executeFilter(spectrum, spectrum.filters[filterIndex]);
      }

      if (tempRollback) {
        reapplyFilters(spectrum);
        updateDomainOptions = getFilterDomain(spectrum, {
          startIndex: Math.min(activeFilterIndex, filterIndex),
          lastIndex: spectrum.filters.length - 1,
        });
      }

      draft.data[index] = spectrum;

      currentIsFid = isFid1DSpectrum(spectrum) || isFid2DSpectrum(spectrum);

      // Update the X and Y domains when switching from FT to FID spectrum,
      if (!previousIsFid && currentIsFid) {
        updateDomainOptions = { updateXDomain: true, updateYDomain: true };
      }
    }

    // re-implement all filters and rest all view property that related to filters
    if (reset) {
      if (filterIndex !== -1 && spectrum.filters.length > 0) {
        // A filter exists, reset the domain based on the filters from the current filter index to the last one
        updateDomainOptions = getFilterDomain(spectrum, {
          startIndex: filterIndex,
          lastIndex: spectrum.filters.length - 1,
        });
      } else if (toolData.activeFilterID) {
        // No filter exists yet, but there is an active one in this case reset both x and y domain

        updateDomainOptions = { updateXDomain: true, updateYDomain: true };
      } else if (searchBy === 'name' && key) {
        // No filter exists yet and no active filter, reset the x and y domain based on the current filter domain rules
        const { updateXDomain, updateYDomain } =
          getFilterUpdateDomainRules(key);
        updateDomainOptions = { updateXDomain, updateYDomain };
      } else {
        //otherwise do not reset the domain
        updateDomainOptions = { updateXDomain: false, updateYDomain: false };
      }
      toolData.activeFilterID = null;
      draft.tempData = null;

      const {
        toolOptions: { data },
      } = getInitialState();
      draft.toolOptions.data = data;
      currentIsFid = isFid1DSpectrum(spectrum) || isFid2DSpectrum(spectrum);
    }
  }
  setDomain(draft, updateDomainOptions);
  if (previousIsFid !== currentIsFid) {
    setMode(draft);
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
  }
}

export interface RollbackSpectrumOptions {
  filterKey?: string;
  reset?: boolean;
  tempRollback?: boolean;
}

function rollbackSpectrum(
  draft: Draft<State>,
  options: RollbackSpectrumOptions,
) {
  const { filterKey, reset = false, tempRollback = false } = options;
  //return back the spectra data to point of time before applying a specific filter
  const applyFilter = !filterKey
    ? true
    : [
        phaseCorrection.name,
        phaseCorrectionTwoDimensions.name,
        fft.name,
        shiftX.name,
        shift2DX.name,
        shift2DY.name,
        signalProcessing.name,
        digitalFilter.name,
        digitalFilter2D.name,
      ].includes(filterKey as any);

  beforeRollback(draft, filterKey);

  rollbackSpectrumByFilter(draft, {
    searchBy: 'name',
    key: filterKey,
    applyFilter,
    reset,
    tempRollback,
  });

  afterRollback(draft, filterKey);
}

function getTwoDimensionFilterOptions(
  draft: Draft<State>,
): TwoDimensionPhaseCorrection['traces'] | null {
  const spectrum = getSpectrum(draft);
  const phaseCorrectionFilter = spectrum.filters.find(
    (filter) => filter.name === Tools.phaseCorrectionTwoDimensions.id,
  );

  if (!isSpectrum2D(spectrum)) {
    return null;
  }

  const { value } = phaseCorrectionFilter || {};
  let filterOptions = getDefaultTwoDimensionsPhaseCorrectionTraceOptions();
  if (value) {
    filterOptions = value;
  }

  return filterOptions;
}

function beforeRollback(draft: Draft<State>, filterKey) {
  const activeSpectrum = getActiveSpectrum(draft);

  switch (filterKey) {
    case phaseCorrection.name: {
      if (activeSpectrum) {
        const spectrum = current(draft).data[activeSpectrum.index];

        // const phaseCorrectionFilter = spectrum.filters.find(
        //   (filter) => filter.name === Filters2D.phaseCorrectionTwoDimensions.id,
        // );

        if (isSpectrum1D(spectrum)) {
          // const { value: filterOptions } = phaseCorrectionFilter || {};
          let pivotObj = {
            value: 0,
            index: 0,
          };
          // if (typeof filterOptions?.pivot === 'number') {
          //   const { pivot } = filterOptions;
          //   const index = xFindClosestIndex(spectrum.data.re, pivot);
          //   pivotObj = { value: pivot, index };
          // } else {
          // look for the strongest peak to set it as a pivot
          const peak = findStrongestPeak(spectrum.data);
          if (peak) {
            const { xValue, index } = peak;
            pivotObj = { value: xValue, index };
          }
          // }

          draft.toolOptions.data.pivot = pivotObj;
        }
      }
      break;
    }

    case phaseCorrectionTwoDimensions.name: {
      if (activeSpectrum) {
        const spectrum = current(draft).data[activeSpectrum.index];

        const filterOptions = getTwoDimensionFilterOptions(draft);

        if (!isSpectrum2D(spectrum) || !filterOptions) {
          return;
        }

        for (const direction in filterOptions) {
          const phaseOptions = draft.toolOptions.data
            .twoDimensionPhaseCorrection.traces[
            direction
          ] as PhaseCorrectionTraceData;
          const { ph0, ph1, pivot, spectra = [] } = filterOptions[direction];
          phaseOptions.ph0 = ph0;
          phaseOptions.ph1 = ph1;
          phaseOptions.scaleRatio = 1;
          phaseOptions.spectra = spectra.map((spectrum) => ({
            ...spectrum,
            id: spectrum?.id || crypto.randomUUID(),
          }));

          const datum = getProjection(
            (spectrum.data as NmrData2DFt).rr,
            direction === 'horizontal' ? 0 : 1,
          );

          if (typeof pivot === 'number') {
            const index = xFindClosestIndex(datum.x, pivot, {
              sorted: false,
            });
            phaseOptions.pivot = { index, value: pivot };
          } else {
            const peak = findStrongestPeak(datum);

            let pivotObj = {
              value: 0,
              index: 0,
            };
            if (peak) {
              const { xValue, index } = peak;
              pivotObj = { value: xValue, index };
            }

            phaseOptions.pivot = pivotObj;
          }
        }
      }
      break;
    }
    case baselineCorrection.name: {
      if (activeSpectrum) {
        const datum = current(draft).data[activeSpectrum.index];
        const baselineCorrectionFilter = datum.filters.find(
          (filter) => filter.name === Filters1D.baselineCorrection.name,
        );
        if (
          !baselineCorrectionFilter ||
          (baselineCorrectionFilter &&
            baselineCorrectionFilter.value.zones?.length === 0)
        ) {
          draft.toolOptions.data.baselineCorrection.zones =
            getBaselineZonesByDietrich(datum.data as NmrData1D);
        } else {
          draft.toolOptions.data.baselineCorrection.zones =
            baselineCorrectionFilter.value.zones;
        }
      }
      break;
    }

    default:
      break;
  }
}
function afterRollback(draft: Draft<State>, filterKey) {
  switch (filterKey) {
    //specify the filters here
    default:
      break;
  }
}
/**
 * getActiveFilterIndex return active filter index. Otherwise, its returns -1
 */
function getActiveFilterIndex(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);
  const id = draft.toolOptions.data.activeFilterID;
  if (id && activeSpectrum) {
    const spectrum = draft.data[activeSpectrum.index];
    const index = spectrum.filters.findIndex((filter) => filter.id === id);
    return index;
  }
  return -1;
}

function updateView(
  draft: Draft<State>,
  filterUpdateDomainRules: Readonly<FilterDomainUpdateRules>,
) {
  draft.tempData = null;
  const { updateXDomain, updateYDomain } = filterUpdateDomainRules;
  resetSelectedTool(draft);
  setDomain(draft, { updateXDomain, updateYDomain });
  setMode(draft);
  changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
}

function disableLivePreview(draft: Draft<State>, id: string) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const { data } = draft.tempData[index];
  draft.data[index].data = data;
  if (baselineCorrection.name !== id) {
    setDomain(draft);
  }
}

function isOneDimensionShift(
  values: ShiftSpectrumOptions,
): values is ShiftOneDimension {
  return 'shift' in values;
}

//action
function handleShiftSpectrumAlongXAxis(
  draft: Draft<State>,
  action: ShiftSpectrumAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  //apply filter into the spectrum
  const options = action.payload;

  const index = activeSpectrum?.index;
  const isOneDimensionSpectrum = isSpectrum1D(draft.data[index]);
  const isOneDimensionShiftFilter = isOneDimensionShift(options);

  if (isOneDimensionShiftFilter && isOneDimensionSpectrum) {
    const { shift } = options;
    rollbackSpectrumByFilter(draft, {
      key: 'shiftX',
      searchBy: 'name',
      applyFilter: false,
    });

    Filters1DManager.applyFilters(draft.data[index] as Spectrum1D, [
      { name: 'shiftX', value: { shift } },
    ]);

    updateView(draft, shiftX.domainUpdateRules);
  }

  if (!isOneDimensionShiftFilter && !isOneDimensionSpectrum) {
    const { shiftX, shiftY } = options;

    if (shiftX) {
      rollbackSpectrumByFilter(draft, {
        key: 'shift2DX',
        searchBy: 'name',
        applyFilter: false,
      });
      Filters2DManager.applyFilters(draft.data[index] as Spectrum2D, [
        { name: 'shift2DX', value: { shift: shiftX } },
      ]);
      updateView(draft, shift2DX.domainUpdateRules);
    }

    if (shiftY) {
      rollbackSpectrumByFilter(draft, {
        key: 'shift2DY',
        searchBy: 'name',
        applyFilter: false,
      });
      Filters2DManager.applyFilters(draft.data[index] as Spectrum2D, [
        { name: 'shift2DY', value: { shift: shiftY } },
      ]);

      updateView(draft, shift2DY.domainUpdateRules);
    }
  }
}

//action
function handleApplyZeroFillingFilter(
  draft: Draft<State>,
  action: ZeroFillingFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const filters: Filter1DEntry[] = [
    {
      name: 'zeroFilling',
      value: action.payload.options,
      enabled: true,
    },
  ];
  Filters1DManager.applyFilters(draft.tempData[index], filters);
  draft.data[index] = draft.tempData[index];

  updateView(draft, zeroFilling.domainUpdateRules);
}
//action
function handleApplyZeroFillingDimensionOneFilter(
  draft: Draft<State>,
  action: ZeroFillingDimensionOneFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const filters: Filter2DEntry[] = [
    {
      name: 'zeroFillingDimension1',
      value: action.payload.options,
      enabled: true,
    },
  ];
  Filters2DManager.applyFilters(draft.tempData[index], filters);
  draft.data[index] = draft.tempData[index];

  updateView(draft, Filters2D.zeroFillingDimension1.domainUpdateRules);
}
//action
function handleApplyZeroFillingDimensionTwoFilter(
  draft: Draft<State>,
  action: ZeroFillingDimensionTwoFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const filters: Filter2DEntry[] = [
    {
      name: 'zeroFillingDimension2',
      value: action.payload.options,
      enabled: true,
    },
  ];
  Filters2DManager.applyFilters(draft.tempData[index], filters);
  draft.data[index] = draft.tempData[index];

  updateView(draft, Filters2D.zeroFillingDimension2.domainUpdateRules);
}

//action
function handleCalculateZeroFillingFilter(
  draft: Draft<State>,
  action: ZeroFillingFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { options, livePreview } = action.payload;
  if (livePreview) {
    const index = activeSpectrum.index;
    const {
      data: { x, re, im },
      filters,
      info,
    } = draft.tempData[index];

    const _data = { data: { x, re, im }, filters, info } as Spectrum1D;
    zeroFilling.apply(_data, options);
    const { im: newIm, re: newRe, x: newX } = _data.data;
    const datum = draft.data[index];

    if (!isSpectrum1D(datum)) {
      return;
    }

    datum.data.x = newX;
    datum.data.im = newIm;
    datum.data.re = newRe;
    draft.xDomain = [newX[0], newX.at(-1) as number];
  } else {
    disableLivePreview(draft, zeroFilling.name);
  }
}
//action
function handleCalculateZeroFillingDimensionOneFilter(
  draft: Draft<State>,
  action: ZeroFillingDimensionOneFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { options, livePreview } = action.payload;
  if (livePreview) {
    const index = activeSpectrum.index;
    const { data, info, filters } = current(draft).tempData[index];

    const _data = structuredClone({
      data,
      info,
      filters,
    }) as Spectrum2D;

    Filters2D.zeroFillingDimension1.apply(_data, options);

    const datum = draft.data[index];

    if (!isSpectrum2D(datum)) {
      return;
    }
    datum.data = _data.data;
    const { xDomain, yDomain, xDomains, yDomains } = get2DDomain(
      current(draft),
    );
    draft.xDomain = xDomain;
    draft.yDomain = yDomain;
    draft.xDomains = xDomains;
    draft.yDomains = yDomains;
  } else {
    disableLivePreview(draft, Filters2D.zeroFillingDimension1.name);
  }
}
//action
function handleCalculateZeroFillingDimensionTwoFilter(
  draft: Draft<State>,
  action: ZeroFillingDimensionTwoFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { options, livePreview } = action.payload;
  if (livePreview) {
    const index = activeSpectrum.index;
    const { data, info, filters } = current(draft).tempData[index];

    const _data = structuredClone({
      data,
      info,
      filters,
    }) as Spectrum2D;

    Filters2D.zeroFillingDimension2.apply(_data, options);

    const datum = draft.data[index];

    if (!isSpectrum2D(datum)) {
      return;
    }
    datum.data = _data.data;

    const { xDomain, yDomain, xDomains, yDomains } = get2DDomain(
      current(draft),
    );

    draft.xDomain = xDomain;
    draft.yDomain = yDomain;
    draft.xDomains = xDomains;
    draft.yDomains = yDomains;
  } else {
    disableLivePreview(draft, Filters2D.zeroFillingDimension2.name);
  }
}

//action
function handleCalculateApodizationFilter(
  draft: Draft<State>,
  action: ApodizationFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const { livePreview, options, tempRollback } = action.payload;

  if (livePreview) {
    const datum = draft.data[index];

    if (!isSpectrum1D(datum)) {
      return;
    }
    const spectrum: Spectrum1D = structuredClone(
      current(draft).tempData[index],
    );

    if (!tempRollback) {
      apodization.apply(spectrum, options);
    } else {
      for (const filter of datum.filters) {
        const { name, value } = filter;

        delete filter.error;

        if (!filter.enabled) {
          continue;
        }

        try {
          const filterOptions = name === 'apodization' ? options : value;
          Filters1D[name].apply(spectrum, filterOptions as any);
        } catch (error: any) {
          filter.error = error.message;
        }
      }
    }

    const { im: newIm, re: newRe } = spectrum.data;

    datum.data.im = newIm;
    datum.data.re = newRe;
  } else {
    disableLivePreview(draft, apodization.name);
  }
}
//action
function handleCalculateApodizationDimensionOneFilter(
  draft: Draft<State>,
  action: ApodizationDimensionOneFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const { livePreview, options } = action.payload;
  if (livePreview) {
    const { data, info } = current(draft).tempData[index];

    const _data = structuredClone({
      data,
      info,
    }) as Spectrum2D;

    Filters2D.apodizationDimension1.apply(_data, options);

    const datum = draft.data[index];

    if (!isSpectrum2D(datum)) {
      return;
    }
    datum.data = _data.data;
  } else {
    disableLivePreview(draft, Filters2D.apodizationDimension1.name);
  }
}
//action
function handleCalculateApodizationDimensionTwoFilter(
  draft: Draft<State>,
  action: ApodizationDimensionTwoFilterLiveAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;
  const { livePreview, options } = action.payload;
  if (livePreview) {
    const { data, info } = current(draft).tempData[index];

    const _data = structuredClone({
      data,
      info,
    }) as Spectrum2D;

    Filters2D.apodizationDimension2.apply(_data, options);

    const datum = draft.data[index];

    if (!isSpectrum2D(datum)) {
      return;
    }
    datum.data = _data.data;
  } else {
    disableLivePreview(draft, Filters2D.apodizationDimension2.name);
  }
}

//action
function handleApplyApodizationFilter(
  draft: Draft<State>,
  action: ApodizationFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;

  Filters1DManager.applyFilters(draft.tempData[index], [
    {
      name: 'apodization',
      value: action.payload.options,
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, apodization.domainUpdateRules);
}
//action
function handleApplyApodizationDimensionOneFilter(
  draft: Draft<State>,
  action: ApodizationDimensionOneFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;

  Filters2DManager.applyFilters(draft.tempData[index], [
    {
      name: 'apodizationDimension1',
      value: action.payload.options,
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, apodization.domainUpdateRules);
}
//action
function handleApplyApodizationDimensionTwoFilter(
  draft: Draft<State>,
  action: ApodizationDimensionTwoFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const index = activeSpectrum.index;

  Filters2DManager.applyFilters(draft.tempData[index], [
    {
      name: 'apodizationDimension2',
      value: action.payload.options,
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, apodization.domainUpdateRules);
}

//action
function handleApplyFFTFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { index } = activeSpectrum;
  const activeFilterIndex = getActiveFilterIndex(draft);

  //apply filter into the spectrum
  Filters1DManager.applyFilters(
    activeFilterIndex !== -1 ? draft.tempData[index] : draft.data[index],
    [{ name: 'fft', value: {} }],
  );

  if (activeFilterIndex !== -1) {
    draft.data[index] = draft.tempData[index];
  }

  updateView(draft, fft.domainUpdateRules);

  //clear zoom history
  draft.zoom.history[draft.view.spectra.activeTab] = [];

  draft.toolOptions.selectedOptionPanel = null;
  draft.toolOptions.selectedTool = 'zoom';
}

function applyFFTTwoDimensionFilter(
  draft: Draft<State>,
  {
    filterName,
    domainUpdateRules,
  }: {
    filterName: 'fftDimension1' | 'fftDimension2';
    domainUpdateRules: FilterDomainUpdateRules;
  },
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { index } = activeSpectrum;
  const activeFilterIndex = getActiveFilterIndex(draft);

  const targetSpectrum =
    activeFilterIndex !== -1 ? draft.tempData[index] : draft.data[index];

  Filters2DManager.applyFilters(targetSpectrum, [
    { name: filterName, value: {} },
  ]);

  if (activeFilterIndex !== -1) {
    draft.data[index] = draft.tempData[index];
  }

  const spectrum = draft.data[index];

  if (isFt2DSpectrum(spectrum)) {
    spectrum.display.contourOptions = getDefaultContoursLevel(spectrum);
  }

  updateView(draft, domainUpdateRules);

  //clear zoom history
  draft.zoom.history[draft.view.spectra.activeTab] = [];

  draft.toolOptions.selectedOptionPanel = null;
  draft.toolOptions.selectedTool = 'zoom';
}

function handleApplyFFtDimension1Filter(draft: Draft<State>) {
  applyFFTTwoDimensionFilter(draft, {
    filterName: 'fftDimension1',
    domainUpdateRules: fftDimension1.domainUpdateRules,
  });
}

function handleApplyFFtDimension2Filter(draft: Draft<State>) {
  applyFFTTwoDimensionFilter(draft, {
    filterName: 'fftDimension2',
    domainUpdateRules: fftDimension2.domainUpdateRules,
  });
}

//action
function handleApplyManualPhaseCorrectionFilter(
  draft: Draft<State>,
  action: ManualPhaseCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;
  const { ph0, ph1 } = action.payload;
  draft.data = draft.tempData;

  Filters1DManager.applyFilters(draft.tempData[index], [
    {
      name: 'phaseCorrection',
      value: { ph0, ph1 },
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, phaseCorrection.domainUpdateRules);
}

//action
function handleAddPhaseCorrectionTrace(
  draft: Draft<State>,
  action: AddPhaseCorrectionTraceAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { x, y } = action.payload;

  const {
    margin,
    width,
    height,
    xDomain,
    yDomain,
    mode,
    data: spectra,
  } = draft;

  const { activeTraces, traces, addTracesToBothDirections } =
    getTwoDimensionPhaseCorrectionOptions(draft);

  const spectrum = spectra[activeSpectrum.index];

  if (isSpectrum2D(spectrum)) {
    const scale2dX = get2DXScale({ margin, width, xDomain, mode });
    const scale2dY = get2DYScale({ margin, height, yDomain });
    const xPPM = scale2dX.invert(x);
    const yPPM = scale2dY.invert(y);
    if (addTracesToBothDirections) {
      for (const direction of Object.keys(traces)) {
        traces[direction].spectra.push({
          id: crypto.randomUUID(),
          x: xPPM,
          y: yPPM,
        });
      }
    } else {
      activeTraces.spectra.push({
        id: crypto.randomUUID(),
        x: xPPM,
        y: yPPM,
      });
    }
  }
}
//action
function handleToggleAddTracesToBothDirections(draft: Draft<State>) {
  const options = draft.toolOptions.data.twoDimensionPhaseCorrection;
  options.addTracesToBothDirections = !options.addTracesToBothDirections;
}

//action
function handleChangePhaseCorrectionDirection(
  draft: Draft<State>,
  action: ChangePhaseCorrectionDirectionAction,
) {
  const { direction } = action.payload;
  const {
    data: { twoDimensionPhaseCorrection },
  } = draft.toolOptions;

  twoDimensionPhaseCorrection.activeTraceDirection = direction;
}

//action
function handleDeletePhaseCorrectionTrace(
  draft: Draft<State>,
  action: DeletePhaseCorrectionTrace,
) {
  const {
    toolOptions: {
      data: {
        twoDimensionPhaseCorrection: { traces, activeTraceDirection },
      },
    },
  } = draft;

  const { id } = action.payload;
  const traceDirection = traces[activeTraceDirection];

  traceDirection.spectra = traceDirection.spectra.filter(
    (trace) => trace.id !== id,
  );
}

//action
function handleCalculateManualPhaseCorrection(
  draft: Draft<State>,
  action: ManualPhaseCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;

  const {
    data: { x, re, im },
    info,
  } = draft.tempData[index];

  const { ph0, ph1 } = action.payload;
  const _data = { data: { x, re, im }, info } as Spectrum1D;
  phaseCorrection.apply(_data, { ph0, ph1 });
  const { im: newIm, re: newRe } = _data.data;
  const datum = draft.data[index];

  if (!isSpectrum1D(datum)) {
    return;
  }

  datum.data.im = newIm;
  datum.data.re = newRe;
}

//action
function handleApplyAbsoluteFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;

  Filters1DManager.applyFilters(draft.tempData[index], [
    {
      name: 'phaseCorrection',
      value: { absolute: true },
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, phaseCorrection.domainUpdateRules);
}

//action
function handleApplyAutoPhaseCorrectionFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;

  Filters1DManager.applyFilters(draft.tempData[index], [
    {
      name: 'phaseCorrection',
      value: {},
    },
  ]);

  draft.data[index] = draft.tempData[index];

  updateView(draft, phaseCorrection.domainUpdateRules);
}

//action
function handleBaseLineCorrectionFilter(
  draft: Draft<State>,
  action: BaselineCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;
  const { zones } = draft.toolOptions.data.baselineCorrection;
  const { options } = action.payload;
  Filters1DManager.applyFilters(draft.tempData[index], [
    {
      name: 'baselineCorrection',
      value: {
        ...options,
        zones,
      },
    } as Extract<Filter1D, { name: 'baseLineCorrection' }>,
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, baselineCorrection.domainUpdateRules);
}

function calculateBaseLineCorrection(
  draft: Draft<State>,
  baseLineOptions?: BaselineCorrectionFilterProps,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;
  const {
    data: { x, re, im },
    info,
  } = draft.tempData[index];
  // save the baseline options temporary
  draft.toolOptions.data.baselineCorrection = {
    ...draft.toolOptions.data.baselineCorrection,
    ...(baseLineOptions && baseLineOptions),
  };
  const { zones, options, livePreview } =
    current(draft).toolOptions.data.baselineCorrection;
  if (livePreview) {
    const _data = { data: { x, re, im }, info } as Spectrum1D;
    baselineCorrection.apply(_data, {
      zones,
      ...options,
    });
    const { im: newIm, re: newRe } = _data.data;
    const datum = draft.data[index];

    if (!isSpectrum1D(datum)) {
      return;
    }

    datum.data.im = newIm;
    datum.data.re = newRe;
  } else {
    disableLivePreview(draft, baselineCorrection.name);
  }
}
//action
function handleCalculateBaseLineCorrection(
  draft: Draft<State>,
  action: BaselineCorrectionFilterLiveAction,
) {
  calculateBaseLineCorrection(draft, action.payload);
}

//action
function handleEnableFilter(draft: Draft<State>, action: EnableFilterAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { id, enabled } = action.payload;
  const datum = draft.data[activeSpectrum.index];

  //apply filter into the spectrum
  if (isSpectrum1D(datum)) {
    Filters1DManager.enableFilter(datum, { id, enabled });
  }
  if (isSpectrum2D(datum)) {
    Filters2DManager.enableFilter(datum, { id, enabled });
  }

  resetSelectedTool(draft);
  setDomain(draft);
  setMode(draft);

  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();

  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
}

function deleteFilter(datum: Spectrum, id?: string) {
  const filters = datum.filters.slice(0);

  let removedFilter;
  if (!id) {
    datum.filters = filters.filter((filter) =>
      nonRemovableFilters.has(filter.name),
    ) as Filter1DEntry[] | Filter2DEntry[];
  } else {
    removedFilter = datum.filters.find((filter) => filter.id === id);
    datum.filters = filters.filter((filter) => filter.id !== id) as
      | Filter1DEntry[]
      | Filter2DEntry[];
  }

  // do not reprocess the filters when the deleted filter is inactive
  if (removedFilter && !removedFilter.enabled) return;

  if (isSpectrum1D(datum)) {
    Filters1DManager.reapplyFilters(datum);
  } else {
    Filters2DManager.reapplyFilters(datum);
  }
}

//action
function handleDeleteFilter(draft: Draft<State>, action: DeleteFilterAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const filterID = action?.payload?.id;
  const datum = draft.data[activeSpectrum.index];
  deleteFilter(datum, filterID);

  draft.toolOptions.data.activeFilterID = null;
  resetSelectedTool(draft);
  setDomain(draft);
  setMode(draft);
}

//action
function handleDeleteSpectraFilter(
  draft: Draft<State>,
  action: DeleteSpectraFilterAction,
) {
  const filterName = action.payload.filterName;

  if (draft.view.spectra.activeTab) {
    for (const datum of draft.data) {
      if (
        nucleusToString(datum?.info?.nucleus) === draft.view.spectra.activeTab
      ) {
        const filtersResult =
          datum.filters?.filter((filter) => filter.name === filterName) || [];

        for (const filter of filtersResult) {
          if (isSpectrum1D(datum)) {
            Filters1DManager.deleteFilter(datum, filter.id);
          }

          if (isSpectrum2D(datum)) {
            Filters2DManager.deleteFilter(datum, filter.id);
          }
        }
      }
    }

    resetSelectedTool(draft);
    setDomain(draft, { domainSpectraScope: 'all' });
    setMode(draft);
  }
}

//action
function handleSetFilterSnapshotHandler(
  draft: Draft<State>,
  action: SetFilterSnapshotAction,
) {
  const {
    filter: { name: filterKey, id },
    tempRollback,
    triggerSource = 'none',
  } = action.payload;

  if (triggerSource === 'processedToggle') {
    return rollbackSpectrum(draft, { filterKey, tempRollback });
  }

  const reset = draft.toolOptions.data.activeFilterID === id;
  if (Tools?.[filterKey]?.isFilter) {
    activateTool(draft, { toolId: filterKey as Tool, reset, tempRollback });
  } else {
    draft.toolOptions.selectedOptionPanel = null;
    draft.toolOptions.selectedTool = 'zoom';
    rollbackSpectrum(draft, { filterKey, reset, tempRollback });
  }
}

//action
function handleSignalProcessingFilter(
  draft: Draft<State>,
  action: ApplySignalProcessingAction,
) {
  const { data, view } = draft;
  const nucleus = view.spectra.activeTab;
  const value = action.payload.options;
  if (!value.range) {
    return;
  }

  const spectra = getSpectraByNucleus(nucleus, data);
  for (const spectrum of spectra) {
    Filters1DManager.applyFilters(
      spectrum as Spectrum1D,
      [
        {
          name: 'signalProcessing',
          value,
        },
      ],
      { forceReapply: true },
    );
  }
  const { updateXDomain, updateYDomain } = signalProcessing.domainUpdateRules;

  setDomain(draft, { updateXDomain, updateYDomain, domainSpectraScope: 'all' });
}

//action
function handleApplyExclusionZone(
  draft: Draft<State>,
  action: ExclusionZoneFilterAction,
) {
  const { zones } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }
  const datum = draft.data[activeSpectrum.index];

  if (!isSpectrum1D(datum)) {
    return;
  }

  Filters1DManager.applyFilters(datum, [
    {
      name: 'exclusionZones',
      value: zones,
    },
  ]);

  const { updateXDomain, updateYDomain } = exclusionZones.domainUpdateRules;

  setDomain(draft, { updateXDomain, updateYDomain });
}
//action
function handleAddExclusionZone(
  draft: Draft<State>,
  action: AddExclusionZoneAction,
) {
  const { startX, endX } = action.payload;
  const range = getRange(draft, { startX, endX });

  let spectra: Spectrum1D[];

  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const index = activeSpectrum?.index;
    spectra = [draft.data[index]] as Spectrum1D[];
  } else {
    spectra = getSpectraByNucleus(
      draft.view.spectra.activeTab,
      draft.data,
    ) as Spectrum1D[];
  }

  for (const spectrum of spectra) {
    Filters1DManager.applyFilters(spectrum, [
      {
        name: 'exclusionZones',
        value: [
          {
            id: crypto.randomUUID(),
            from: range[0],
            to: range[1],
          },
        ],
      },
    ]);
  }

  const { updateXDomain, updateYDomain } = exclusionZones.domainUpdateRules;

  setDomain(draft, { updateXDomain, updateYDomain });
}

//action
function handleDeleteExclusionZone(
  draft: Draft<State>,
  action: DeleteExclusionZoneAction,
) {
  const { zone, spectrumId } = action.payload;

  // if spectrum id exists, remove the selected exclusion zone in the spectrum
  if (spectrumId) {
    const spectrumIndex = draft.data.findIndex(
      (spectrum) => spectrum.id === spectrumId,
    );
    const spectrum = draft.data[spectrumIndex];
    const filter = spectrum.filters.find(
      (_filter) => _filter.name === 'exclusionZones',
    );
    if (filter && isSpectrum1D(spectrum)) {
      if (filter.value.length === 1) {
        Filters1DManager.deleteFilter(spectrum, filter.id);
      } else {
        filter.value = filter.value.filter((_zone) => _zone.id !== zone?.id);
        Filters1DManager.reapplyFilters(spectrum);
      }
    }
  } else {
    // remove all exclusion zones that have the same range in all spectra
    const data = getSpectraByNucleus(draft.view.spectra.activeTab, draft.data);
    for (const datum of data) {
      for (const filter of datum.filters) {
        if (filter.name === 'exclusionZones' && isSpectrum1D(datum)) {
          filter.value = filter.value.filter(
            (_zone) => zone.from !== _zone.from && zone.to !== _zone.to,
          );
          Filters1DManager.reapplyFilters(datum);
        }
      }
    }
  }
}

function handleSetOneDimensionPhaseCorrectionPivotPoint(
  draft: Draft<State>,
  action: SetOneDimensionPhaseCorrectionPivotPoint,
) {
  const { value: xValue } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }
  const datum = draft.data[activeSpectrum.index];

  if (!isSpectrum1D(datum)) {
    return;
  }

  const scaleX = getXScale(draft);
  const value = scaleX.invert(xValue);
  const index = xFindClosestIndex(datum.data.x, value);
  draft.toolOptions.data.pivot = { value, index };
}
function handleSetTwoDimensionPhaseCorrectionPivotPoint(
  draft: Draft<State>,
  action: SetTwoDimensionPhaseCorrectionPivotPoint,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const {
    data: spectra,
    margin,
    width,
    height,
    yDomain,
    xDomain,
    mode,
  } = draft;

  const { x, y } = action.payload;
  const { activeTraces, activeTraceDirection } =
    getTwoDimensionPhaseCorrectionOptions(draft);

  switch (activeTraceDirection) {
    case 'horizontal':
      {
        const scale = get2DXScale({ margin, width, xDomain, mode });
        const pivotValue = scale.invert(x);
        const spectrum = spectra[activeSpectrum.index];
        const datum = getProjection((spectrum.data as NmrData2DFt).rr, 0);
        const index = xFindClosestIndex(datum.x, pivotValue);
        activeTraces.pivot = { value: pivotValue, index };
      }
      break;
    case 'vertical':
      {
        const scale = get2DYScale({ margin, height, yDomain });
        const pivotValue = scale.invert(y);
        const spectrum = spectra[activeSpectrum.index];
        const datum = getProjection((spectrum.data as NmrData2DFt).rr, 1);
        const index = xFindClosestIndex(datum.x, pivotValue);
        activeTraces.pivot = { value: pivotValue, index };
      }
      break;

    default:
      break;
  }
}

//action
function handleCalculateManualTwoDimensionPhaseCorrection(
  draft: Draft<State>,
  action: ManualTwoDimensionsPhaseCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  const { activeTraces } = getTwoDimensionPhaseCorrectionOptions(draft);
  const { ph0, ph1, applyOn2D = false } = action.payload;
  activeTraces.ph0 = ph0;
  activeTraces.ph1 = ph1;

  if (!applyOn2D || !activeSpectrum) {
    return;
  }

  const { index } = activeSpectrum;
  const spectrum = structuredClone(current(draft).tempData[index]);
  const datum = draft.data[index];

  if (!isSpectrum2D(datum) || !spectrum) {
    return;
  }

  const filterOptions = getTwoDimensionsPhaseCorrectionOptions(draft);

  phaseCorrectionTwoDimensions.apply(spectrum, filterOptions);
  draft.data[index].data = spectrum.data;
}

function getTwoDimensionsPhaseCorrectionOptions(draft: Draft<State>) {
  const filterOptions =
    draft.toolOptions.data.twoDimensionPhaseCorrection.traces;

  const result = {};
  for (const direction in filterOptions) {
    const { ph0, ph1, pivot, spectra } = filterOptions[
      direction
    ] as PhaseCorrectionTraceData;
    result[direction] = {
      ph0,
      ph1,
      pivot: pivot?.value,
      spectra: spectra.map(({ x, y }) => ({
        x,
        y,
      })),
    };
  }
  return result;
}

//action
function handleApplyManualTowDimensionsPhaseCorrectionFilter(
  draft: Draft<State>,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;
  draft.data = draft.tempData;
  const filterOptions = getTwoDimensionsPhaseCorrectionOptions(draft);

  Filters2DManager.applyFilters(draft.tempData[index], [
    {
      name: 'phaseCorrectionTwoDimensions',
      value: filterOptions,
    },
  ]);
  draft.data[index] = draft.tempData[index];

  updateView(draft, phaseCorrectionTwoDimensions.domainUpdateRules);
}

//action
function handleApplyAutoPhaseCorrectionTwoDimensionsFilter(
  draft: Draft<State>,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;

  Filters2DManager.applyFilters(draft.tempData[index], [
    {
      name: 'phaseCorrectionTwoDimensions',
      value: {},
    },
  ]);

  draft.data[index] = draft.tempData[index];

  updateView(draft, phaseCorrectionTwoDimensions.domainUpdateRules);
}

function handleReorderFilters(
  draft: Draft<State>,
  action: ReorderFiltersAction,
) {
  const { sourceId, targetId } = action.payload;
  const spectrum = getSpectrum(draft);

  if (!spectrum) {
    return;
  }

  const filters = spectrum.filters;

  const sourceIndex = filters.findIndex((filter) => filter.name === sourceId);
  const targetIndex = filters.findIndex((filter) => filter.name === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return;

  const sourceFilter = filters[sourceIndex];
  filters.splice(sourceIndex, 1);
  filters.splice(targetIndex, 0, sourceFilter);
  if (isSpectrum1D(spectrum)) {
    Filters1DManager.reapplyFilters(spectrum);
  } else {
    Filters2DManager.reapplyFilters(spectrum);
  }
}

export {
  calculateBaseLineCorrection,
  handleAddExclusionZone,
  handleAddPhaseCorrectionTrace,
  handleApplyAbsoluteFilter,
  handleApplyApodizationDimensionOneFilter,
  handleApplyApodizationDimensionTwoFilter,
  handleApplyApodizationFilter,
  handleApplyAutoPhaseCorrectionFilter,
  handleApplyAutoPhaseCorrectionTwoDimensionsFilter,
  handleApplyExclusionZone,
  handleApplyFFTFilter,
  handleApplyFFtDimension1Filter,
  handleApplyFFtDimension2Filter,
  handleApplyManualPhaseCorrectionFilter,
  handleApplyManualTowDimensionsPhaseCorrectionFilter,
  handleApplyZeroFillingDimensionOneFilter,
  handleApplyZeroFillingDimensionTwoFilter,
  handleApplyZeroFillingFilter,
  handleBaseLineCorrectionFilter,
  handleCalculateApodizationDimensionOneFilter,
  handleCalculateApodizationDimensionTwoFilter,
  handleCalculateApodizationFilter,
  handleCalculateBaseLineCorrection,
  handleCalculateManualPhaseCorrection,
  handleCalculateManualTwoDimensionPhaseCorrection,
  handleCalculateZeroFillingDimensionOneFilter,
  handleCalculateZeroFillingDimensionTwoFilter,
  handleCalculateZeroFillingFilter,
  handleChangePhaseCorrectionDirection,
  handleDeleteExclusionZone,
  handleDeleteFilter,
  handleDeletePhaseCorrectionTrace,
  handleDeleteSpectraFilter,
  handleEnableFilter,
  handleReorderFilters,
  handleSetFilterSnapshotHandler,
  handleSetOneDimensionPhaseCorrectionPivotPoint,
  handleSetTwoDimensionPhaseCorrectionPivotPoint,
  handleShiftSpectrumAlongXAxis,
  handleSignalProcessingFilter,
  handleToggleAddTracesToBothDirections,
  rollbackSpectrum,
  rollbackSpectrumByFilter,
};
