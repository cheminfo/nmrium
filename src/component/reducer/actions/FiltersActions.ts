import { current, Draft } from 'immer';

import * as Filters from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import { updateXShift } from '../../../data/data1d/Spectrum1D';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { updateShift as update2dShift } from '../../../data/data2d/Spectrum2D';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import nucleusToString from '../../utility/nucleusToString';
import { ActiveSpectrum, State } from '../Reducer';
import zoomHistoryManager from '../helper/ZoomHistoryManager';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { resetSelectedTool } from './ToolsActions';

function shiftSpectrumAlongXAxis(draft: Draft<State>, shiftValue) {
  //apply filter into the spectrum
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum?.index;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, options: shiftValue },
    ]);
    updateXShift(draft.data[index] as Datum1D);
    resetSelectedTool(draft);
    setDomain(draft);
  }
}

function applyZeroFillingFilter(draft: Draft<State>, filterOptions) {
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;
    const filters = [
      { name: Filters.zeroFilling.id, options: filterOptions.zeroFillingSize },
      {
        name: Filters.lineBroadening.id,
        options: filterOptions.lineBroadeningValue,
      },
    ];
    FiltersManager.applyFilter(draft.data[index], filters);
    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
}
function applyFFTFilter(draft: Draft<State>) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    //apply filter into the spectrum
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.fft.id, options: {} },
    ]);
    resetSelectedTool(draft);
    changeSpectrumVerticalAlignment(draft, { align: 'bottom' });

    setDomain(draft);
    setMode(draft);
  }
}
function applyManualPhaseCorrectionFilter(draft: Draft<State>, filterOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { ph0, ph1 } = filterOptions;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    resetSelectedTool(draft);
    draft.tempData = null;
    setDomain(draft);
  }
}
function applyAbsoluteFilter(draft: Draft<State>) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.absolute.id, options: {} },
    ]);

    resetSelectedTool(draft);
    draft.tempData = null;
    setDomain(draft);
  }
}

function applyAutoPhaseCorrectionFilter(draft: Draft<State>) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const { ph0, ph1 } = autoPhaseCorrection(draft.data[index]);

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    resetSelectedTool(draft);
    draft.tempData = null;
    setDomain(draft);
  }
}

function calculateManualPhaseCorrection(draft: Draft<State>, filterOptions) {
  if (draft.activeSpectrum) {
    const { index } = draft.activeSpectrum;
    const {
      data: { x, re, im },
      info,
    } = draft.data[index] as Datum1D;

    const { ph0, ph1 } = filterOptions;
    let _data = { data: { x: x, re: re, im }, info };
    phaseCorrection(_data, { ph0, ph1 });
    const { im: newIm, re: newRe } = _data.data;
    draft.tempData[index].data.im = newIm;
    draft.tempData[index].data.re = newRe;
  }
}

function enableFilter(draft: Draft<State>, filterID, checked) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    //apply filter into the spectrum
    FiltersManager.enableFilter(draft.data[index], filterID, checked);

    if (draft.data[index].info?.dimension === 1) {
      updateXShift(draft.data[index] as Datum1D);
    } else if (draft.data[index].info?.dimension === 2) {
      update2dShift(draft.data[index] as Datum2D);
    }

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);

    const zoomHistory = zoomHistoryManager(draft.zoom.history, draft.activeTab);
    const zoomValue = zoomHistory.getLast();
    if (zoomValue) {
      draft.xDomain = zoomValue.xDomain;
      draft.yDomain = zoomValue.yDomain;
    }
  }
}

function deleteFilter(draft: Draft<State>, actions) {
  const filterID = actions.payload.id;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    //apply filter into the spectrum
    FiltersManager.deleteFilter(draft.data[index], filterID);

    if (draft.data[index].info?.dimension === 1) {
      updateXShift(draft.data[index] as Datum1D);
    } else if (draft.data[index].info?.dimension === 2) {
      update2dShift(draft.data[index] as Datum2D);
    }

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
}
function deleteSpectraFilter(draft: Draft<State>, actions) {
  const filterType = actions.payload.filterType;

  if (draft.activeTab) {
    for (const datum of draft.data) {
      if (nucleusToString(datum?.info?.nucleus) === draft.activeTab) {
        const filtersResult =
          datum.filters?.filter((filter) => filter.name === filterType) || [];

        filtersResult.forEach((filter) => {
          FiltersManager.deleteFilter(datum, filter.id);

          if (datum.info?.dimension === 1) {
            updateXShift(datum as Datum1D);
          } else if (datum.info?.dimension === 2) {
            update2dShift(datum as Datum2D);
          }
        });
      }
    }

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
}

function handleBaseLineCorrectionFilter(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    FiltersManager.applyFilter(draft.data[index], [
      {
        name: Filters.baselineCorrection.id,
        options: {
          zones: draft.toolOptions.data.baseLineZones,
          ...action.options,
        },
      },
    ]);

    draft.toolOptions.data.baseLineZones = [];
    const xDomainSnapshot = draft.xDomain.slice();

    resetSelectedTool(draft);
    setDomain(draft);
    draft.xDomain = xDomainSnapshot;
  }
}

/**
 * reset spectrum data for specific point of time (Filter)
 * @param {object} draft
 * @param {string} id Filter id
 * @param {object} options
 * @param {boolean=} options.resetTool
 * @param {boolean=} options.updateDomain
 * @param {boolean=} options.rollback
 */
function resetSpectrumByFilter(
  draft,
  id: string | null = null,
  options: {
    rollback?: boolean;
    resetTool?: boolean;
    updateDomain?: boolean;
    returnCurrentDatum?: boolean;
    searchBy?: 'id' | 'name';
  } = {},
  activeSpectrum: ActiveSpectrum | null = null,
) {
  const {
    updateDomain = true,
    rollback = false,
    searchBy = 'id',
    returnCurrentDatum = false,
  } = options;

  let currentDatum: any = null;

  const currentActiveSpectrum = activeSpectrum
    ? activeSpectrum
    : draft.activeSpectrum;

  if (currentActiveSpectrum?.id) {
    const index = currentActiveSpectrum.index;
    const datum = draft.data[index] as Datum1D | Datum2D;

    if (id && draft.toolOptions.data.activeFilterID !== id) {
      const filterIndex = datum.filters.findIndex((f) => f[searchBy] === id);
      let filters: any[] = [];
      if (filterIndex !== -1) {
        filters = datum.filters.slice(
          0,
          rollback ? filterIndex : filterIndex + 1,
        );

        if (filters.length > 1) {
          draft.toolOptions.data.activeFilterID =
            datum.filters[rollback ? filterIndex - 1 : filterIndex]?.id;
        } else {
          draft.toolOptions.data.activeFilterID = null;
        }

        FiltersManager.reapplyFilters(datum, filters);

        if (returnCurrentDatum) {
          const { name, value: options } = datum.filters[filterIndex];
          const newDatum = current(draft).data[index];
          if (newDatum.info?.dimension === 1) {
            FiltersManager.applyFilter(newDatum, [{ name, options }]);
          }

          currentDatum = { datum: newDatum, index };
        }
      }
    } else {
      //close filter snapshot mode and replay all enabled filters
      draft.toolOptions.data.activeFilterID = null;
      FiltersManager.reapplyFilters(datum);
    }

    if (datum.info?.dimension === 1) {
      updateXShift(datum as Datum1D);
    } else if (datum.info?.dimension === 2) {
      update2dShift(datum as Datum2D);
    }

    if (updateDomain) {
      setDomain(draft);
      setMode(draft);
    }
  }
  if (returnCurrentDatum) {
    return currentDatum;
  }
}

function filterSnapshotHandler(draft: Draft<State>, action) {
  resetSpectrumByFilter(draft, action.id);
}

function handleMultipleSpectraFilter(draft: Draft<State>, action) {
  if (draft.data && draft.data.length > 0) {
    for (let datum of draft.data) {
      if (
        datum.info?.dimension === 1 &&
        datum.info.nucleus === draft.activeTab &&
        Array.isArray(action.payload)
      ) {
        const filters = action.payload.map((filter) => {
          if (filter.name === Filters.equallySpaced.id) {
            const exclusions =
              draft.toolOptions.data.exclusionZones[draft.activeTab] || [];
            return {
              ...filter,
              options: { ...filter.options, exclusions },
            };
          }
          return filter;
        });

        FiltersManager.applyFilter(datum, filters);
      }
    }
  }
  setDomain(draft);
}

export {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  applyAutoPhaseCorrectionFilter,
  applyAbsoluteFilter,
  calculateManualPhaseCorrection,
  handleMultipleSpectraFilter,
  enableFilter,
  deleteFilter,
  deleteSpectraFilter,
  handleBaseLineCorrectionFilter,
  filterSnapshotHandler,
  resetSpectrumByFilter,
};
