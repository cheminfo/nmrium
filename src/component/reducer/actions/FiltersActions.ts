import { v4 } from '@lukeed/uuid';
import { current, Draft } from 'immer';
import { Spectrum, Spectrum1D } from 'nmr-load-save';

import * as Filters from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import {
  apply as apodization,
  defaultApodizationOptions,
} from '../../../data/data1d/filter1d/apodization';
import { apply as baselineCorrection } from '../../../data/data1d/filter1d/baselineCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { apply as zeroFilling } from '../../../data/data1d/filter1d/zeroFilling';
import { options as Tools } from '../../toolbar/ToolTypes';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import nucleusToString from '../../utility/nucleusToString';
import { ActiveSpectrum, getInitialState, State } from '../Reducer';
import zoomHistoryManager from '../helper/ZoomHistoryManager';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { getStrongestPeak } from '../helper/getStrongestPeak';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { activateTool, resetSelectedTool } from './ToolsActions';

function shiftSpectrumAlongXAxis(draft: Draft<State>, action) {
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

function applyZeroFillingFilter(draft: Draft<State>, action) {
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

function calculateApodizationFilter(draft: Draft<State>, action) {
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

function applyApodizationFilter(draft: Draft<State>, action) {
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

function calculateZeroFillingFilter(draft: Draft<State>, action) {
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
    draft.xDomain = [newX[0], newX[newX.length - 1]];
  }
}
function applyFFTFilter(draft: Draft<State>) {
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
function applyManualPhaseCorrectionFilter(draft: Draft<State>, action) {
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
function applyAbsoluteFilter(draft: Draft<State>) {
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

function applyAutoPhaseCorrectionFilter(draft: Draft<State>) {
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

function calculateBaseLineCorrection(draft: Draft<State>, action?) {
  const baseLineOptions = action.payload;
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
function calculateManualPhaseCorrection(draft: Draft<State>, action) {
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

function enableFilter(draft: Draft<State>, action) {
  const { id: filterID, checked } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    //apply filter into the spectrum
    FiltersManager.enableFilter(
      draft.data[activeSpectrum.index],
      filterID,
      checked,
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

function deleteFilter(draft: Draft<State>, actions) {
  const filterID = actions.payload?.id;
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
function deleteSpectraFilter(draft: Draft<State>, actions) {
  const filterType = actions.payload.filterType;

  if (draft.view.spectra.activeTab) {
    for (const datum of draft.data) {
      if (
        nucleusToString(datum?.info?.nucleus) === draft.view.spectra.activeTab
      ) {
        const filtersResult =
          datum.filters?.filter((filter) => filter.name === filterType) || [];

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

function handleBaseLineCorrectionFilter(draft: Draft<State>, action) {
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
            zones,
            ...options,
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

/**
 * reset spectrum data for specific point of time (Filter)
 * @param {object} draft
 * @param {object} options
 * @param {string}   options.id Filter id
 * @param {boolean=} options.resetTool
 * @param {boolean=} options.updateDomain
 * @param {boolean=} options.rollback
 */

function getFilterUpdateDomainRules(filterName: string) {
  return (
    // eslint-disable-next-line import/namespace
    Filters[filterName]?.DOMAIN_UPDATE_RULES || {
      updateXDomain: false,
      updateYDomain: false,
    }
  );
}

function rollbackSpectrumByFilter(
  draft: Draft<State>,
  options?: {
    applyFilter?: boolean;
    reset?: boolean;
    searchBy?: 'id' | 'name';
    key?: string | null;
    activeSpectrum?: ActiveSpectrum | null;
    triggerSource?: 'Apply' | 'none';
  },
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
        draft.toolOptions.selectedTool = Tools.zoom.id;
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
      draft.toolOptions.selectedTool = Tools.zoom.id;
      currentIsFid = datum.info.isFid;
    }
  }

  setDomain(draft, updateDomainOptions);
  if (previousIsFid !== currentIsFid) {
    setMode(draft);
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
  }
}

function filterSnapshotHandler(draft: Draft<State>, action) {
  const { name: filterKey, id } = action.payload;
  const reset = draft.toolOptions.data.activeFilterID === id;

  if (Tools?.[filterKey]?.isFilter) {
    activateTool(draft, { toolId: filterKey, reset });
  } else {
    resetSelectedTool(draft);
    rollbackSpectrum(draft, { filterKey, reset });
  }
}

function handleMultipleSpectraFilter(draft: Draft<State>, action) {
  const spectra = getSpectraByNucleus(draft.view.spectra.activeTab, draft.data);

  if (spectra && spectra.length > 0 && Array.isArray(action.payload)) {
    const exclusions =
      spectra[0].filters.find((f) => f.name === Filters.exclusionZones.id)
        ?.value || [];

    for (const spectrum of spectra) {
      const filters = action.payload.map((filter) => {
        if (filter.name === Filters.equallySpaced.id) {
          return {
            ...filter,
            options: { ...filter.options, exclusions },
          };
        }
        return filter;
      });

      FiltersManager.applyFilter(spectrum, filters);
    }
  }
  setDomain(draft);
}

function handleSignalProcessingFilter(draft: Draft<State>, action) {
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

function handleAddExclusionZone(draft: Draft<State>, action) {
  const { from: startX, to: endX } = action.payload;
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

function handleDeleteExclusionZone(draft: Draft<State>, action) {
  const { zone, spectrumID } = action.payload;

  // if spectrum id exists, remove the selected exclusion zone in the spectrum
  if (spectrumID) {
    const spectrumIndex = draft.data.findIndex(
      (spectrum) => spectrum.id === spectrumID,
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

export {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyApodizationFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  applyAutoPhaseCorrectionFilter,
  applyAbsoluteFilter,
  calculateManualPhaseCorrection,
  calculateBaseLineCorrection,
  calculateApodizationFilter,
  calculateZeroFillingFilter,
  handleMultipleSpectraFilter,
  enableFilter,
  deleteFilter,
  deleteSpectraFilter,
  handleBaseLineCorrectionFilter,
  filterSnapshotHandler,
  rollbackSpectrumByFilter,
  handleAddExclusionZone,
  handleDeleteExclusionZone,
  rollbackSpectrum,
  handleSignalProcessingFilter,
};
