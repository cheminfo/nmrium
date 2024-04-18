import { v4 } from '@lukeed/uuid';
import { NmrData1D, NmrData2DFt } from 'cheminfo-types';
import { current, Draft } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';
import {
  ActiveSpectrum,
  Spectrum,
  Spectrum1D,
  Spectrum2D,
} from 'nmr-load-save';
import {
  Filters,
  FiltersManager,
  BaselineCorrectionOptions,
  ApodizationOptions,
  getBaselineZones,
} from 'nmr-processing';

import { defaultApodizationOptions } from '../../../data/constants/DefaultApodizationOptions';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import { getProjection } from '../../../data/data2d/Spectrum2D/getMissingProjection';
import { ExclusionZone } from '../../../data/types/data1d/ExclusionZone';
import { MatrixOptions } from '../../../data/types/data1d/MatrixOptions';
import { getXScale } from '../../1d/utilities/scale';
import { get2DXScale, get2DYScale } from '../../2d/utilities/scale';
import { Tool, options as Tools } from '../../toolbar/ToolTypes';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import nucleusToString from '../../utility/nucleusToString';
import {
  getDefaultTwoDimensionsPhaseCorrectionTraceOptions,
  getInitialState,
  PhaseCorrectionTraceData,
  State,
  TraceDirection,
  TwoDimensionPhaseCorrection,
} from '../Reducer';
import zoomHistoryManager from '../helper/ZoomHistoryManager';
import { findStrongestPeak } from '../helper/findStrongestPeak';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { getSpectrum } from '../helper/getSpectrum';
import { getTwoDimensionPhaseCorrectionOptions } from '../helper/getTwoDimensionPhaseCorrectionOptions';
import { ActionType } from '../types/ActionType';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { activateTool, resetSelectedTool } from './ToolsActions';

const {
  fft,
  fftDimension1,
  fftDimension2,
  apodization,
  baselineCorrection,
  phaseCorrection,
  phaseCorrectionTwoDimensions,
  zeroFilling,
  shiftX,
  shift2DX,
  shift2DY,
  exclusionZones,
  signalProcessing,
} = Filters;

type ShiftSpectrumAlongXAxisAction = ActionType<
  'SHIFT_SPECTRUM',
  { shift: number }
>;
type ApodizationFilterAction = ActionType<
  'APPLY_APODIZATION_FILTER',
  { options: ApodizationOptions }
>;
type ApodizationFilterLiveAction = ActionType<
  'CALCULATE_APODIZATION_FILTER',
  { options: ApodizationOptions; livePreview: boolean }
>;
type ZeroFillingFilterAction = ActionType<
  'APPLY_ZERO_FILLING_FILTER',
  { options: { nbPoints: number } }
>;
type ZeroFillingFilterLiveAction = ActionType<
  'CALCULATE_ZERO_FILLING_FILTER',
  { options: { nbPoints: number }; livePreview: boolean }
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
  { name: string; id: string }
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
  { options: MatrixOptions }
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

type SetOneDimensionPhaseCorrectionPivotPoint = ActionType<
  'SET_ONE_DIMENSION_PIVOT_POINT',
  { value: number }
>;
type SetTwoDimensionPhaseCorrectionPivotPoint = ActionType<
  'SET_TWO_DIMENSION_PIVOT_POINT',
  { x: number; y: number }
>;

export type FiltersActions =
  | ShiftSpectrumAlongXAxisAction
  | ApodizationFilterAction
  | ApodizationFilterLiveAction
  | ZeroFillingFilterAction
  | ZeroFillingFilterLiveAction
  | ManualPhaseCorrectionFilterAction
  | BaselineCorrectionFilterAction
  | BaselineCorrectionFilterLiveAction
  | EnableFilterAction
  | DeleteFilterAction
  | DeleteSpectraFilterAction
  | SetFilterSnapshotAction
  | AddExclusionZoneAction
  | DeleteExclusionZoneAction
  | ApplySignalProcessingAction
  | AddPhaseCorrectionTraceAction
  | ChangePhaseCorrectionDirectionAction
  | DeletePhaseCorrectionTrace
  | SetOneDimensionPhaseCorrectionPivotPoint
  | SetTwoDimensionPhaseCorrectionPivotPoint
  | ManualTwoDimensionsPhaseCorrectionFilterAction
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

function getFilterUpdateDomainRules(
  filterName: string,
  defaultRule?: FiltersManager.FilterDomainUpdateRules,
) {
  return (
    Filters[filterName]?.DOMAIN_UPDATE_RULES ||
    defaultRule || {
      updateXDomain: false,
      updateYDomain: false,
    }
  );
}

export interface RollbackSpectrumByFilterOptions {
  applyFilter?: boolean;
  reset?: boolean;
  searchBy?: 'id' | 'name';
  key?: string | null;
  activeSpectrum?: ActiveSpectrum | null;
  triggerSource?: 'Apply' | 'none';
}

function getFilterDomain(
  datum: Spectrum,
  options: { startIndex: number; lastIndex: number },
) {
  const { startIndex, lastIndex } = options;
  const updateDomainOptions: FiltersManager.FilterDomainUpdateRules = {
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

function rollbackSpectrumByFilter(
  draft: Draft<State>,
  options?: RollbackSpectrumByFilterOptions,
) {
  const {
    applyFilter = true,
    searchBy = 'id',
    reset = false,
    key,
    activeSpectrum,
    triggerSource = 'none',
  } = options || {};

  const currentActiveSpectrum = activeSpectrum || getActiveSpectrum(draft);
  let updateDomainOptions: Partial<FiltersManager.FilterDomainUpdateRules> = {
    updateXDomain: false,
    updateYDomain: false,
  };
  let previousIsFid = false;
  let currentIsFid = false;

  if (currentActiveSpectrum) {
    const index = currentActiveSpectrum.index;
    const datum = draft.data[index] as Spectrum;
    previousIsFid = datum.info.isFid;
    const filterIndex = datum.filters.findIndex((f) => f[searchBy] === key);

    if (filterIndex !== -1 && !reset) {
      const { activeFilterID } = draft.toolOptions.data;
      const activeFilterIndex = activeFilterID
        ? datum.filters.findIndex((f) => f.id === activeFilterID)
        : datum.filters.length - 1;
      //set active filter
      draft.toolOptions.data.activeFilterID =
        datum.filters?.[filterIndex]?.id || null;

      const filters: any[] = datum.filters.slice(0, filterIndex || 1);

      updateDomainOptions = getFilterDomain(datum, {
        startIndex: Math.min(activeFilterIndex, filterIndex),
        lastIndex: Math.max(activeFilterIndex, filterIndex),
      });

      FiltersManager.reapplyFilters(datum, filters);

      draft.tempData = current(draft).data;
      // apply the current Filters
      if (applyFilter) {
        const { name, value } = datum.filters[filterIndex];
        Filters[name].apply(datum, value);
      }

      currentIsFid = datum.info.isFid;

      //if we still point to the same filter then close the filter options panel and reset the selected tool to default one (zoom tool)
      if (
        activeFilterID === datum.filters[filterIndex].id &&
        triggerSource === 'Apply'
      ) {
        draft.toolOptions.selectedOptionPanel = null;
        draft.toolOptions.selectedTool = 'zoom';
      }
    }

    if (filterIndex === -1 || reset) {
      if (draft.tempData) {
        FiltersManager.reapplyFilters(datum);
      }
      //if the filter is not exists, create a clone of the current data
      draft.tempData = current(draft).data;
    }

    // re-implement all filters and rest all view property that related to filters
    if (reset) {
      draft.toolOptions.data.activeFilterID = null;
      draft.tempData = null;

      if (datum.filters.length > 0 && filterIndex !== -1) {
        updateDomainOptions = getFilterDomain(datum, {
          startIndex: filterIndex,
          lastIndex: datum.filters.length - 1,
        });
      }
      const {
        toolOptions: { data },
      } = getInitialState();
      draft.toolOptions.data = data;
      currentIsFid = datum.info.isFid;
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
}

function rollbackSpectrum(
  draft: Draft<State>,
  options: RollbackSpectrumOptions,
) {
  const { filterKey, reset = false } = options;
  //return back the spectra data to point of time before applying a specific filter

  const applyFilter = !filterKey
    ? true
    : [
        phaseCorrection.id,
        phaseCorrectionTwoDimensions.id,
        fft.id,
        shiftX.id,
        shift2DX.id,
        shift2DY.id,
        signalProcessing.id,
      ].includes(filterKey);

  beforeRollback(draft, filterKey);

  rollbackSpectrumByFilter(draft, {
    searchBy: 'name',
    key: filterKey,
    applyFilter,
    reset,
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
    case phaseCorrection.id: {
      if (activeSpectrum) {
        const spectrum = current(draft).data[activeSpectrum.index];

        const phaseCorrectionFilter = spectrum.filters.find(
          (filter) => filter.name === Tools.phaseCorrectionTwoDimensions.id,
        );

        if (isSpectrum1D(spectrum)) {
          const { value: filterOptions } = phaseCorrectionFilter || {};
          let pivotObj = {
            value: 0,
            index: 0,
          };
          if (typeof filterOptions?.pivot === 'number') {
            const { pivot } = filterOptions;
            const index = xFindClosestIndex(spectrum.data.re, pivot);
            pivotObj = { value: pivot, index };
          } else {
            // look for the strongest peak to set it as a pivot
            const peak = findStrongestPeak(spectrum.data);
            if (peak) {
              const { xValue, index } = peak;
              pivotObj = { value: xValue, index };
            }
          }

          draft.toolOptions.data.pivot = pivotObj;
        }
      }
      break;
    }

    case phaseCorrectionTwoDimensions.id: {
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
            id: spectrum?.id || v4(),
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
    case baselineCorrection.id: {
      if (activeSpectrum) {
        const datum = current(draft).data[activeSpectrum.index];
        const baselineCorrectionFilter = datum.filters.find(
          (filter) => filter.name === Tools.baselineCorrection.id,
        );
        if (
          !baselineCorrectionFilter ||
          (baselineCorrectionFilter &&
            baselineCorrectionFilter.value.zones?.length === 0)
        ) {
          draft.toolOptions.data.baselineCorrection.zones = getBaselineZones(
            datum.data as NmrData1D,
          );
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
  // const activeSpectrum = getActiveSpectrum(draft);

  switch (filterKey) {
    case apodization.id: {
      draft.toolOptions.data.apodizationOptions = defaultApodizationOptions;
      break;
    }
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
  filterUpdateDomainRules: Readonly<FiltersManager.FilterDomainUpdateRules>,
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
  const { data } = draft.tempData[index] as Spectrum1D;
  draft.data[index].data = data;
  if (baselineCorrection.id !== id) {
    setDomain(draft);
  }

  // reset default options
  switch (id) {
    case apodization.id: {
      draft.toolOptions.data.apodizationOptions = defaultApodizationOptions;
      break;
    }
    default:
      break;
  }
}

//action
function handleShiftSpectrumAlongXAxis(
  draft: Draft<State>,
  action: ShiftSpectrumAlongXAxisAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  //apply filter into the spectrum
  const { shift } = action.payload;

  const activeFilterIndex = getActiveFilterIndex(draft);
  const index = activeSpectrum?.index;

  FiltersManager.applyFilter(draft.data[index], [
    { name: shiftX.id, value: { shift } },
  ]);

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: shiftX.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, shiftX.DOMAIN_UPDATE_RULES);
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

  const activeFilterIndex = getActiveFilterIndex(draft);

  const index = activeSpectrum.index;
  const filters = [
    {
      name: zeroFilling.id,
      value: action.payload.options,
    },
  ];
  FiltersManager.applyFilter(draft.tempData[index], filters, {
    filterIndex: activeFilterIndex,
  });
  draft.data[index] = draft.tempData[index];
  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: zeroFilling.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, zeroFilling.DOMAIN_UPDATE_RULES);
  }
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
    } = draft.tempData[index] as Spectrum1D;

    const _data = { data: { x, re, im }, filters, info };
    zeroFilling.apply(_data as Spectrum1D, options);
    const { im: newIm, re: newRe, x: newX } = _data.data;
    const datum = draft.data[index] as Spectrum1D;
    datum.data.x = newX;
    datum.data.im = newIm;
    datum.data.re = newRe;
    draft.xDomain = [newX[0], newX.at(-1) as number];
  } else {
    disableLivePreview(draft, zeroFilling.name);
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
  const { livePreview, options } = action.payload;
  if (livePreview) {
    const {
      data: { x, re, im },
      info,
    } = draft.tempData[index] as Spectrum1D;

    const _data = { data: { x, re, im }, info };
    draft.toolOptions.data.apodizationOptions = options;
    apodization.apply(_data as Spectrum1D, options);
    const { im: newIm, re: newRe } = _data.data;
    const datum = draft.data[index] as Spectrum1D;
    datum.data.im = newIm;
    datum.data.re = newRe;
  } else {
    disableLivePreview(draft, apodization.name);
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
  const activeFilterIndex = getActiveFilterIndex(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: apodization.id,
        value: action.payload.options,
      },
    ],
    { filterIndex: activeFilterIndex },
  );
  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: apodization.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, apodization.DOMAIN_UPDATE_RULES);
  }
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
  FiltersManager.applyFilter(
    activeFilterIndex !== -1 ? draft.tempData[index] : draft.data[index],
    [{ name: fft.id, value: {} }],
    { filterIndex: activeFilterIndex },
  );

  if (activeFilterIndex !== -1) {
    draft.data[index] = draft.tempData[index];
  }

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: fft.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, fft.DOMAIN_UPDATE_RULES);
  }

  //clear zoom history
  draft.zoom.history[draft.view.spectra.activeTab] = [];

  draft.toolOptions.selectedOptionPanel = null;
  draft.toolOptions.selectedTool = 'zoom';
}

function handleApplyFFtDimension1Filter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { index } = activeSpectrum;
  const activeFilterIndex = getActiveFilterIndex(draft);

  //apply filter into the spectrum
  FiltersManager.applyFilter(
    activeFilterIndex !== -1 ? draft.tempData[index] : draft.data[index],
    [{ name: fftDimension1.id, value: {} }],
    { filterIndex: activeFilterIndex },
  );

  if (activeFilterIndex !== -1) {
    draft.data[index] = draft.tempData[index];
  }

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: fftDimension1.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, fftDimension1.DOMAIN_UPDATE_RULES);
  }

  //clear zoom history
  draft.zoom.history[draft.view.spectra.activeTab] = [];

  draft.toolOptions.selectedOptionPanel = null;
  draft.toolOptions.selectedTool = 'zoom';
}

function handleApplyFFtDimension2Filter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const { index } = activeSpectrum;
  const activeFilterIndex = getActiveFilterIndex(draft);

  //apply filter into the spectrum
  FiltersManager.applyFilter(
    activeFilterIndex !== -1 ? draft.tempData[index] : draft.data[index],
    [{ name: fftDimension2.id, value: {} }],
    { filterIndex: activeFilterIndex },
  );

  if (activeFilterIndex !== -1) {
    draft.data[index] = draft.tempData[index];
  }

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: fftDimension2.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, fftDimension2.DOMAIN_UPDATE_RULES);
  }

  //clear zoom history
  draft.zoom.history[draft.view.spectra.activeTab] = [];

  draft.toolOptions.selectedOptionPanel = null;
  draft.toolOptions.selectedTool = 'zoom';
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
  const activeFilterIndex = getActiveFilterIndex(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: phaseCorrection.id,
        value: { ph0, ph1 },
      },
    ],
    { filterIndex: activeFilterIndex },
  );
  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: phaseCorrection.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, phaseCorrection.DOMAIN_UPDATE_RULES);
  }
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

  const spectrum = spectra[activeSpectrum.index] as Spectrum2D;

  if (isSpectrum2D(spectrum)) {
    const scale2dX = get2DXScale({ margin, width, xDomain, mode });
    const scale2dY = get2DYScale({ margin, height, yDomain });
    const xPPM = scale2dX.invert(x);
    const yPPM = scale2dY.invert(y);
    if (addTracesToBothDirections) {
      for (const direction of Object.keys(traces)) {
        traces[direction].spectra.push({
          id: v4(),
          x: xPPM,
          y: yPPM,
        });
      }
    } else {
      activeTraces.spectra.push({
        id: v4(),
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
  } = draft.tempData[index] as Spectrum1D;

  const { ph0, ph1 } = action.payload;
  const _data = { data: { x, re, im }, info };
  phaseCorrection.apply(_data as Spectrum1D, { ph0, ph1 });
  const { im: newIm, re: newRe } = _data.data;
  const datum = draft.data[index] as Spectrum1D;

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
  const activeFilterIndex = getActiveFilterIndex(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: phaseCorrection.id,
        value: { absolute: true },
      },
    ],
    { filterIndex: activeFilterIndex },
  );
  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: phaseCorrection.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, phaseCorrection.DOMAIN_UPDATE_RULES);
  }
}

//action
function handleApplyAutoPhaseCorrectionFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum || !draft.tempData) {
    return;
  }

  const { index } = activeSpectrum;
  const activeFilterIndex = getActiveFilterIndex(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: phaseCorrection.id,
        value: {},
      },
    ],
    { filterIndex: activeFilterIndex },
  );

  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: phaseCorrection.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, phaseCorrection.DOMAIN_UPDATE_RULES);
  }
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
  const activeFilterIndex = getActiveFilterIndex(draft);
  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: baselineCorrection.id,
        value: {
          ...options,
          zones,
        },
      },
    ],

    { filterIndex: activeFilterIndex },
  );
  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: baselineCorrection.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, baselineCorrection.DOMAIN_UPDATE_RULES);
  }
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
  } = draft.tempData[index] as Spectrum1D;
  // save the baseline options temporary
  draft.toolOptions.data.baselineCorrection = {
    ...draft.toolOptions.data.baselineCorrection,
    ...(baseLineOptions && baseLineOptions),
  };
  const { zones, options, livePreview } =
    current(draft).toolOptions.data.baselineCorrection;
  if (livePreview) {
    const _data = { data: { x, re, im }, info };
    baselineCorrection.apply(_data as Spectrum1D, {
      zones,
      ...options,
    });
    const { im: newIm, re: newRe } = _data.data;
    const datum = draft.data[index] as Spectrum1D;
    datum.data.im = newIm;
    datum.data.re = newRe;
  } else {
    disableLivePreview(draft, baselineCorrection.id);
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

  const { id: filterID, enabled } = action.payload;

  //apply filter into the spectrum
  FiltersManager.enableFilter(
    draft.data[activeSpectrum.index],
    filterID,
    enabled,
  );

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

//action
function handleDeleteFilter(draft: Draft<State>, action: DeleteFilterAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) {
    return;
  }

  const filterID = action?.payload?.id;

  //apply filter into the spectrum
  FiltersManager.deleteFilter(draft.data[activeSpectrum.index], filterID);
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
          FiltersManager.deleteFilter(datum, filter.id);
        }
      }
    }

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
}

//action
function handleSetFilterSnapshotHandler(
  draft: Draft<State>,
  action: SetFilterSnapshotAction,
) {
  const { name: filterKey, id } = action.payload;
  const reset = draft.toolOptions.data.activeFilterID === id;
  if (Tools?.[filterKey]?.isFilter) {
    activateTool(draft, { toolId: filterKey as Tool, reset });
  } else {
    rollbackSpectrum(draft, { filterKey, reset });
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

  const spectra = getSpectraByNucleus(nucleus, data) as Spectrum1D[];
  for (const spectrum of spectra) {
    FiltersManager.applyFilter(
      spectrum,
      [
        {
          name: signalProcessing.id,
          value,
        },
      ],
      { forceReapply: true },
    );
  }
  const { updateXDomain, updateYDomain } = signalProcessing.DOMAIN_UPDATE_RULES;

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
    spectra = [draft.data[index] as Spectrum1D];
  } else {
    spectra = getSpectraByNucleus(
      draft.view.spectra.activeTab,
      draft.data,
    ) as Spectrum1D[];
  }

  for (const spectrum of spectra) {
    FiltersManager.applyFilter(spectrum, [
      {
        name: exclusionZones.id,
        value: [
          {
            id: v4(),
            from: range[0],
            to: range[1],
          },
        ],
      },
    ]);
  }

  const { updateXDomain, updateYDomain } = exclusionZones.DOMAIN_UPDATE_RULES;

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
    const filter = draft.data[spectrumIndex].filters.find(
      (_filter) => _filter.name === exclusionZones.id,
    );
    if (filter) {
      if (filter.value.length === 1) {
        FiltersManager.deleteFilter(draft.data[spectrumIndex], filter.id);
      } else {
        filter.value = filter.value.filter((_zone) => _zone.id !== zone?.id);
        FiltersManager.reapplyFilters(draft.data[spectrumIndex]);
      }
    }
  } else {
    // remove all exclusion zones that have the same range in all spectra
    const data = getSpectraByNucleus(draft.view.spectra.activeTab, draft.data);
    for (const datum of data) {
      for (const filter of datum.filters) {
        if (filter.name === exclusionZones.id) {
          filter.value = filter.value.filter(
            (_zone) => zone.from !== _zone.from && zone.to !== _zone.to,
          );
          FiltersManager.reapplyFilters(datum);
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
  if (activeSpectrum?.id) {
    const scaleX = getXScale(draft);
    const value = scaleX.invert(xValue);
    const datum = draft.data[activeSpectrum.index] as Spectrum1D;
    const index = xFindClosestIndex(datum.data.x, value);
    draft.toolOptions.data.pivot = { value, index };
  }
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
        const spectrum = spectra[activeSpectrum.index] as Spectrum2D;
        const datum = getProjection((spectrum.data as NmrData2DFt).rr, 0);
        const index = xFindClosestIndex(datum.x, pivotValue);
        activeTraces.pivot = { value: pivotValue, index };
      }
      break;
    case 'vertical':
      {
        const scale = get2DYScale({ margin, height, yDomain });
        const pivotValue = scale.invert(y);
        const spectrum = spectra[activeSpectrum.index] as Spectrum2D;
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
  const spectrum = draft.tempData[index];

  if (!isSpectrum2D(spectrum)) {
    return;
  }

  const filterOptions = getTwoDimensionsPhaseCorrectionOptions(draft);

  const { data, info } = spectrum;
  const _data = { data, info };
  phaseCorrectionTwoDimensions.apply(_data, filterOptions);
  draft.data[index].data = _data.data;
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
  const activeFilterIndex = getActiveFilterIndex(draft);
  const filterOptions = getTwoDimensionsPhaseCorrectionOptions(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: phaseCorrectionTwoDimensions.id,
        value: filterOptions,
      },
    ],
    { filterIndex: activeFilterIndex },
  );
  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: phaseCorrectionTwoDimensions.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, phaseCorrectionTwoDimensions.DOMAIN_UPDATE_RULES);
  }
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
  const activeFilterIndex = getActiveFilterIndex(draft);

  FiltersManager.applyFilter(
    draft.tempData[index],
    [
      {
        name: phaseCorrectionTwoDimensions.id,
        value: {},
      },
    ],
    { filterIndex: activeFilterIndex },
  );

  draft.data[index] = draft.tempData[index];

  if (activeFilterIndex !== -1) {
    rollbackSpectrumByFilter(draft, {
      searchBy: 'name',
      key: phaseCorrectionTwoDimensions.id,
      triggerSource: 'Apply',
    });
  } else {
    updateView(draft, phaseCorrectionTwoDimensions.DOMAIN_UPDATE_RULES);
  }
}

export {
  handleShiftSpectrumAlongXAxis,
  handleApplyZeroFillingFilter,
  handleApplyApodizationFilter,
  handleApplyFFTFilter,
  handleApplyFFtDimension1Filter,
  handleApplyFFtDimension2Filter,
  handleApplyManualPhaseCorrectionFilter,
  handleApplyManualTowDimensionsPhaseCorrectionFilter,
  handleApplyAutoPhaseCorrectionFilter,
  handleApplyAbsoluteFilter,
  handleCalculateManualPhaseCorrection,
  calculateBaseLineCorrection,
  handleCalculateBaseLineCorrection,
  handleCalculateApodizationFilter,
  handleCalculateZeroFillingFilter,
  handleEnableFilter,
  handleDeleteFilter,
  handleDeleteSpectraFilter,
  handleBaseLineCorrectionFilter,
  handleSetFilterSnapshotHandler,
  handleAddExclusionZone,
  handleDeleteExclusionZone,
  handleSignalProcessingFilter,
  rollbackSpectrum,
  rollbackSpectrumByFilter,
  handleAddPhaseCorrectionTrace,
  handleChangePhaseCorrectionDirection,
  handleDeletePhaseCorrectionTrace,
  handleSetOneDimensionPhaseCorrectionPivotPoint,
  handleSetTwoDimensionPhaseCorrectionPivotPoint,
  handleCalculateManualTwoDimensionPhaseCorrection,
  handleToggleAddTracesToBothDirections,
  handleApplyAutoPhaseCorrectionTwoDimensionsFilter,
};
