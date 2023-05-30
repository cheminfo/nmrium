import { v4 } from '@lukeed/uuid';
import { current, Draft } from 'immer';
import { Spectrum, Spectrum1D, Filters, FiltersManager, BaselineCorrectionOptions, ApodizationOptions } from 'nmr-processing';

import { ExclusionZone } from '../../../data/types/data1d/ExclusionZone';
import { MatrixOptions } from '../../../data/types/data1d/MatrixOptions';
import { defaultApodizationOptions } from '../../../data/constants/DefaultApodizationOptions';
import { options as Tools } from '../../toolbar/ToolTypes';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import nucleusToString from '../../utility/nucleusToString';
import { ActiveSpectrum, getInitialState, State } from '../Reducer';
import zoomHistoryManager from '../helper/ZoomHistoryManager';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { getStrongestPeak } from '../helper/getStrongestPeak';
import { ActionType } from '../types/ActionType';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { activateTool, resetSelectedTool } from './ToolsActions';

const { apply: apodization } = Filters.apodization;
const { apply: baselineCorrection } = Filters.baselineCorrection;
const { apply: phaseCorrection } = Filters.phaseCorrection;
const { apply: zeroFilling } = Filters.zeroFilling;

type ShiftSpectrumAlongXAxisAction = ActionType<
  'SHIFT_SPECTRUM',
  { shift: number }
>;
type ApodizationFilterAction = ActionType<
  'APPLY_APODIZATION_FILTER' | 'CALCULATE_APODIZATION_FILTER',
  ApodizationOptions
>;
type ZeroFillingFilterAction = ActionType<
  'APPLY_ZERO_FILLING_FILTER' | 'CALCULATE_ZERO_FILLING_FILTER',
  { nbPoints: number }
>;
type ManualPhaseCorrectionFilterAction = ActionType<
  | 'APPLY_MANUAL_PHASE_CORRECTION_FILTER'
  | 'CALCULATE_MANUAL_PHASE_CORRECTION_FILTER',
  { ph0: number; ph1: number }
>;

type BaselineCorrectionFilterProps = Omit<
  BaselineCorrectionOptions,
  'zones'
> & { livePreview: boolean };

type BaselineCorrectionFilterAction = ActionType<
  'APPLY_BASE_LINE_CORRECTION_FILTER' | 'CALCULATE_BASE_LINE_CORRECTION_FILTER',
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

export type FiltersActions =
  | ShiftSpectrumAlongXAxisAction
  | ApodizationFilterAction
  | ZeroFillingFilterAction
  | ManualPhaseCorrectionFilterAction
  | BaselineCorrectionFilterAction
  | EnableFilterAction
  | DeleteFilterAction
  | DeleteSpectraFilterAction
  | SetFilterSnapshotAction
  | AddExclusionZoneAction
  | DeleteExclusionZoneAction
  | ApplySignalProcessingAction
  | ActionType<
      | 'APPLY_FFT_FILTER'
      | 'APPLY_AUTO_PHASE_CORRECTION_FILTER'
      | 'APPLY_ABSOLUTE_FILTER'
    >;

function getFilterUpdateDomainRules(filterName: string) {
  return (

    Filters[filterName]?.DOMAIN_UPDATE_RULES || {
      updateXDomain: false,
      updateYDomain: false,
    }
  );
}

interface RollbackSpectrumByFilterOptions {
  applyFilter?: boolean;
  reset?: boolean;
  searchBy?: 'id' | 'name';
  key?: string | null;
  activeSpectrum?: ActiveSpectrum | null;
  triggerSource?: 'Apply' | 'none';
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
  let updateDomainOptions: FiltersManager.FilterDomainUpdateRules = {
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

    const activeFilterId = draft.toolOptions.data.activeFilterID;
    if (filterIndex !== -1 && !reset) {
      const filters: any[] = datum.filters.slice(0, filterIndex || 1);

      //set active filter
      draft.toolOptions.data.activeFilterID = datum.filters[filterIndex]?.id;

      if (filters.length > 0) {
        for (let i = 0; i <= filterIndex; i++) {
          const { updateXDomain, updateYDomain } = getFilterUpdateDomainRules(
            datum.filters[i].name,
          );
          updateDomainOptions.updateXDomain =
            updateXDomain || updateDomainOptions.updateXDomain;
          updateDomainOptions.updateYDomain =
            updateYDomain || updateDomainOptions.updateYDomain;
        }
        FiltersManager.reapplyFilters(datum, filters);
      }

      draft.tempData = current(draft).data;

      // apply the current Filters
      if (applyFilter) {
        FiltersManager.reapplyFilters(
          datum,
          datum.filters.slice(0, filterIndex + 1),
        );
      }

      currentIsFid = datum.info.isFid;

      //if we still point to the same filter then close the filter options panel and reset the selected tool to default one (zoom tool)
      if (
        activeFilterId === datum.filters[filterIndex].id &&
        triggerSource === 'Apply'
      ) {
        draft.toolOptions.selectedOptionPanel = null;
        draft.toolOptions.selectedTool = 'zoom';
      }
    } else {
      //if the filter is not exists, create a clone of the current data
      draft.tempData = current(draft).data;
    }
    // re-implement all filters and rest all view property that related to filters
    if (reset) {
      draft.tempData = null;
      FiltersManager.reapplyFilters(datum);
      updateDomainOptions = { updateXDomain: true, updateYDomain: true };
      const {
        toolOptions: { data },
      } = getInitialState();
      draft.toolOptions.data = data;
      draft.toolOptions.selectedOptionPanel = null;
      draft.toolOptions.selectedTool = 'zoom';
      currentIsFid = datum.info.isFid;
    }
  }

  setDomain(draft, updateDomainOptions);
  if (previousIsFid !== currentIsFid) {
    setMode(draft);
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
  }
}

interface RollbackSpectrumOptions {
  updateFilterViewOptions?: boolean;
  filterKey: string;
  reset?: boolean;
}

function rollbackSpectrum(
  draft: Draft<State>,
  options: RollbackSpectrumOptions,
) {
  const { filterKey, reset = false, updateFilterViewOptions = true } = options;
  //return back the spectra data to point of time before applying a specific filter

  const applyFilter = [
    Filters.phaseCorrection.id,
    Filters.fft.id,
    Filters.shiftX.id,
    Filters.shift2DX.id,
    Filters.shift2DY.id,
    Filters.signalProcessing.id,
  ].includes(filterKey);

  rollbackSpectrumByFilter(draft, {
    searchBy: 'name',
    key: filterKey,
    applyFilter,
    reset,
  });

  if (updateFilterViewOptions) {
    updateFilterOptionsInView(draft, filterKey);
  }
}

function updateFilterOptionsInView(draft: Draft<State>, filterKey) {
  const activeSpectrum = getActiveSpectrum(draft);

  switch (filterKey) {
    case Filters.phaseCorrection.id: {
      // look for the strongest peak to set it as a pivot
      const { xValue, index } = getStrongestPeak(draft) || {
        xValue: 0,
        index: 0,
      };

      draft.toolOptions.data.pivot = { value: xValue, index };

      break;
    }
    case Filters.baselineCorrection.id: {
      if (activeSpectrum) {
        const baselineCorrectionFilter: any = current(draft).data[
          activeSpectrum.index
        ].filters.find((filter) => filter.name === Tools.baselineCorrection.id);

        if (baselineCorrectionFilter) {
          draft.toolOptions.data.baselineCorrection.zones =
            baselineCorrectionFilter
              ? baselineCorrectionFilter.value.zones
              : [];
        }
      }
      break;
    }
    case Filters.apodization.id: {
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

//action
function handleShiftSpectrumAlongXAxis(
  draft: Draft<State>,
  action: ShiftSpectrumAlongXAxisAction,
) {
  //apply filter into the spectrum
  const { shift } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const activeFilterIndex = getActiveFilterIndex(draft);
    const index = activeSpectrum?.index;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, value: { shift } },
    ]);

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.shiftX.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.shiftX.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleApplyZeroFillingFilter(
  draft: Draft<State>,
  action: ZeroFillingFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const activeFilterIndex = getActiveFilterIndex(draft);

    const index = activeSpectrum.index;
    const filters = [
      {
        name: Filters.zeroFilling.id,
        value: action.payload,
      },
    ];
    FiltersManager.applyFilter(draft.data[index], filters, {
      filterIndex: activeFilterIndex,
    });

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.zeroFilling.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.zeroFilling.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleCalculateZeroFillingFilter(
  draft: Draft<State>,
  action: ZeroFillingFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const index = activeSpectrum.index;
    const {
      data: { x, re, im },
      filters,
      info,
    } = draft.tempData[index] as Spectrum1D;

    let _data = { data: { x, re, im }, filters, info };
    zeroFilling(_data as Spectrum1D, action.payload);
    const { im: newIm, re: newRe, x: newX } = _data.data;
    const datum = draft.data[index] as Spectrum1D;
    datum.data.x = newX;
    datum.data.im = newIm;
    datum.data.re = newRe;
    draft.xDomain = [newX[0], newX.at(-1) as number];
  }
}

//action
function handleCalculateApodizationFilter(
  draft: Draft<State>,
  action: ApodizationFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const index = activeSpectrum.index;
    const options = action.payload;
    const {
      data: { x, re, im },
      info,
    } = draft.tempData[index] as Spectrum1D;

    let _data = { data: { x, re, im }, info };
    draft.toolOptions.data.apodizationOptions = options;
    apodization(_data as Spectrum1D, options);
    const { im: newIm, re: newRe } = _data.data;
    const datum = draft.data[index] as Spectrum1D;
    datum.data.im = newIm;
    datum.data.re = newRe;
  }
}

//action
function handleApplyApodizationFilter(
  draft: Draft<State>,
  action: ApodizationFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const index = activeSpectrum.index;
    const activeFilterIndex = getActiveFilterIndex(draft);

    FiltersManager.applyFilter(
      draft.data[index],
      [
        {
          name: Filters.apodization.id,
          value: action.payload,
        },
      ],
      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.apodization.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.apodization.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleApplyFFTFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const activeFilterIndex = getActiveFilterIndex(draft);

    //apply filter into the spectrum
    FiltersManager.applyFilter(
      draft.data[index],
      [{ name: Filters.fft.id, value: {} }],
      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.fft.id,
      });
    } else {
      updateView(draft, Filters.fft.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleApplyManualPhaseCorrectionFilter(
  draft: Draft<State>,
  action: ManualPhaseCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const { ph0, ph1 } = action.payload;
    draft.data = draft.tempData;
    const activeFilterIndex = getActiveFilterIndex(draft);

    FiltersManager.applyFilter(
      draft.data[index],
      [
        {
          name: Filters.phaseCorrection.id,
          value: { ph0, ph1 },
        },
      ],
      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.phaseCorrection.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.phaseCorrection.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleCalculateManualPhaseCorrection(
  draft: Draft<State>,
  action: ManualPhaseCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;

    const {
      data: { x, re, im },
      info,
    } = draft.tempData[index] as Spectrum1D;

    const { ph0, ph1 } = action.payload;
    let _data = { data: { x, re, im }, info };
    phaseCorrection(_data as Spectrum1D, { ph0, ph1 });
    const { im: newIm, re: newRe } = _data.data;
    const datum = draft.data[index] as Spectrum1D;

    datum.data.im = newIm;
    datum.data.re = newRe;
  }
}

//action
function handleApplyAbsoluteFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const activeFilterIndex = getActiveFilterIndex(draft);

    FiltersManager.applyFilter(
      draft.data[index],
      [
        {
          name: Filters.phaseCorrection.id,
          value: { absolute: true },
        },
      ],
      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.phaseCorrection.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.phaseCorrection.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleApplyAutoPhaseCorrectionFilter(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const activeFilterIndex = getActiveFilterIndex(draft);

    FiltersManager.applyFilter(
      draft.data[index],
      [
        {
          name: Filters.phaseCorrection.id,
          value: {},
        },
      ],
      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.phaseCorrection.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.phaseCorrection.DOMAIN_UPDATE_RULES);
    }
  }
}

//action
function handleBaseLineCorrectionFilter(
  draft: Draft<State>,
  action: BaselineCorrectionFilterAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { zones } = draft.toolOptions.data.baselineCorrection;
    const { livePreview, ...options } = action.payload;
    const activeFilterIndex = getActiveFilterIndex(draft);
    FiltersManager.applyFilter(
      draft.data[activeSpectrum.index],
      [
        {
          name: Filters.baselineCorrection.id,
          value: {
            ...options,
            zones,
          },
        },
      ],

      { filterIndex: activeFilterIndex },
    );

    if (activeFilterIndex !== -1) {
      rollbackSpectrumByFilter(draft, {
        searchBy: 'name',
        key: Filters.baselineCorrection.id,
        triggerSource: 'Apply',
      });
    } else {
      updateView(draft, Filters.baselineCorrection.DOMAIN_UPDATE_RULES);
    }
  }
}

function calculateBaseLineCorrection(
  draft: Draft<State>,
  baseLineOptions?: BaselineCorrectionFilterProps,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const {
      data: { x, re, im },
      info,
    } = draft.tempData[index] as Spectrum1D;
    // save the baseline options temporary
    draft.toolOptions.data.baselineCorrection = {
      ...draft.toolOptions.data.baselineCorrection,
      ...(baseLineOptions ? { options: baseLineOptions } : {}),
    };

    const { zones, options } = draft.toolOptions.data.baselineCorrection;
    const { livePreview, ...filterOptions } = options;
    if (livePreview) {
      let _data = { data: { x, re, im }, info };
      baselineCorrection(_data as Spectrum1D, {
        zones,
        ...filterOptions,
      });
      const { im: newIm, re: newRe } = _data.data;
      const datum = draft.data[index] as Spectrum1D;
      datum.data.im = newIm;
      datum.data.re = newRe;
    }
  }
}
//action
function handleCalculateBaseLineCorrection(
  draft: Draft<State>,
  action: BaselineCorrectionFilterAction,
) {
  calculateBaseLineCorrection(draft, action.payload);
}

//action
function handleEnableFilter(draft: Draft<State>, action: EnableFilterAction) {
  const { id: filterID, enabled } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
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
}

//action
function handleDeleteFilter(draft: Draft<State>, action: DeleteFilterAction) {
  const filterID = action?.payload?.id;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    //apply filter into the spectrum
    FiltersManager.deleteFilter(draft.data[activeSpectrum.index], filterID);
    draft.toolOptions.data.activeFilterID = null;
    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
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
    activateTool(draft, { toolId: filterKey, reset });
  } else {
    resetSelectedTool(draft);
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
  const activeFilterIndex = getActiveFilterIndex(draft);

  const spectra = getSpectraByNucleus(nucleus, data) as Spectrum1D[];
  for (const spectrum of spectra) {
    FiltersManager.applyFilter(
      spectrum,
      [
        {
          name: Filters.signalProcessing.id,
          value,
        },
      ],
      { filterIndex: activeFilterIndex },
    );
  }
  const { updateXDomain, updateYDomain } =
    Filters.signalProcessing.DOMAIN_UPDATE_RULES;

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
        name: Filters.exclusionZones.id,
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

  const { updateXDomain, updateYDomain } =
    Filters.exclusionZones.DOMAIN_UPDATE_RULES;

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
      (_filter) => _filter.name === Filters.exclusionZones.id,
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
        if (filter.name === Filters.exclusionZones.id) {
          filter.value = filter.value.filter(
            (_zone) => zone.from !== _zone.from && zone.to !== _zone.to,
          );
          FiltersManager.reapplyFilters(datum);
        }
      }
    }
  }
}

export {
  handleShiftSpectrumAlongXAxis,
  handleApplyZeroFillingFilter,
  handleApplyApodizationFilter,
  handleApplyFFTFilter,
  handleApplyManualPhaseCorrectionFilter,
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
};
