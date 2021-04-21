import { Draft } from 'immer';

import { Filters } from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import { Datum1D, updateXShift } from '../../../data/data1d/Datum1D';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import {
  Datum2D,
  updateShift as update2dShift,
} from '../../../data/data2d/Datum2D';
import nucluesToString from '../../utility/nucluesToString';
import { State } from '../Reducer';
import getClosestNumber from '../helper/GetClosestNumber';
import ZoomHistory from '../helper/ZoomHistory';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { resetSelectedTool } from './ToolsActions';

function setDataBy1DFilter(datum: Datum1D) {
  datum.data.y = datum.data.re;
}

function shiftSpectrumAlongXAxis(draft: Draft<State>, shiftValue) {
  //apply filter into the spectrum
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, options: shiftValue },
    ]);
    updateXShift(draft.data[index] as Datum1D);
    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
    setDomain(draft);
  }
}

function applyZeroFillingFilter(draft: Draft<State>, filterOptions) {
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;
    // const activeObject = AnalysisObj.getDatum(activeSpectrumId);
    const filters = [
      { name: Filters.zeroFilling.id, options: filterOptions.zeroFillingSize },
      {
        name: Filters.lineBroadening.id,
        options: filterOptions.lineBroadeningValue,
      },
    ];
    FiltersManager.applyFilter(draft.data[index], filters);
    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
    setDomain(draft);
    setMode(draft);
  }
}
function applyFFTFilter(draft: Draft<State>) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    // const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    //apply filter into the spectrum
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.fft.id, options: {} },
    ]);
    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
    changeSpectrumVerticalAlignment(draft, false, true);

    setDomain(draft);
    setMode(draft);
  }
}
function applyManualPhaseCorrectionFilter(draft: Draft<State>, filterOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    let { ph0, ph1 } = filterOptions;
    const datum = draft.data[index] as Datum1D;
    const closest = getClosestNumber(datum.data.x, draft.pivot);
    const pivotIndex = datum.data.x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / datum.data.y.length;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
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
    setDataBy1DFilter(draft.data[index] as Datum1D);
    draft.tempData = null;
    setDomain(draft);
  }
}

function applyAutoPhaseCorrectionFilter(draft: Draft<State>) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const {
      data: { x, y, im },
      info,
    } = draft.tempData[index];

    let _data = { data: { x, re: y, im }, info };
    const { data, ph0, ph1 } = autoPhaseCorrection(_data);

    const { im: newIm, re: newRe } = data;
    draft.tempData[index].data.im = newIm;
    draft.tempData[index].data.y = newRe;
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);
    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
    draft.tempData = null;
    setDomain(draft);
  }
}

function calculateManualPhaseCorrection(draft: Draft<State>, filterOptions) {
  const { tempData } = draft;
  const { index } = draft.activeSpectrum;
  const {
    data: { x, y, im },
    info,
  } = tempData[index];

  let { ph0, ph1 } = filterOptions;
  const closest = getClosestNumber(tempData[index].data.x, draft.pivot);
  const pivotIndex = tempData[index].data.x.indexOf(closest);

  ph0 = ph0 - (ph1 * pivotIndex) / y.length;

  let _data = { data: { x, re: y, im }, info };
  phaseCorrection(_data, { ph0, ph1 });
  const { im: newIm, re: newRe } = _data.data;
  draft.tempData[index].data.im = newIm;
  draft.tempData[index].data.y = newRe;
}

function enableFilter(draft: Draft<State>, filterID, checked) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    //apply filter into the spectrum
    FiltersManager.enableFilter(draft.data[index], filterID, checked);

    if (draft.data[index].info?.dimension === 1) {
      updateXShift(draft.data[index] as Datum1D);
      setDataBy1DFilter(draft.data[index] as Datum1D);
    } else if (draft.data[index].info?.dimension === 2) {
      update2dShift(draft.data[index] as Datum2D);
    }

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);

    const zoomHistory = ZoomHistory.getInstance(
      draft.ZoomHistory,
      draft.activeTab,
    );
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
      setDataBy1DFilter(draft.data[index] as Datum1D);
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
      if (nucluesToString(datum?.info?.nucleus) === draft.activeTab) {
        const filtersResult =
          datum.filters?.filter((filter) => filter.name === filterType) || [];

        filtersResult.forEach((filter) => {
          FiltersManager.deleteFilter(datum, filter.id);

          if (datum.info?.dimension === 1) {
            updateXShift(datum as Datum1D);
            setDataBy1DFilter(datum as Datum1D);
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
        options: { zones: draft.baseLineZones, ...action.options },
      },
    ]);

    draft.baseLineZones = [];
    const xDomainSnapshot = draft.xDomain.slice();

    resetSelectedTool(draft);
    setDataBy1DFilter(draft.data[index] as Datum1D);
    setDomain(draft);
    draft.xDomain = xDomainSnapshot;
  }
}

function filterSnapshotHandler(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;

    if (action.id) {
      const filterIndex = (draft.data[index] as Datum1D).filters.findIndex(
        (f) => f.id === action.id,
      );
      const filters = (draft.data[index] as Datum1D).filters.slice(
        0,
        filterIndex + 1,
      );
      FiltersManager.reapplyFilters(draft.data[index], filters);
    } else {
      //close filter snapshot mode and replay all enabled filters
      FiltersManager.reapplyFilters(draft.data[index]);
    }
    // const activeObject = AnalysisObj.getDatum(id);

    resetSelectedTool(draft);
    setDomain(draft);
    setMode(draft);
  }
}

function handleFromToFilter(draft: Draft<State>, action) {
  if (draft.data && draft.data.length > 0) {
    for (let datum of draft.data) {
      if (
        datum.info?.dimension === 1 &&
        datum.info.nucleus === draft.activeTab
      ) {
        FiltersManager.applyFilter(datum, [
          {
            name: Filters.fromTo.id,
            options: action.payload,
          },
        ]);
        (datum as Datum1D).data.y = (datum as Datum1D).data.re;
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
  handleFromToFilter,
  enableFilter,
  deleteFilter,
  deleteSpectraFilter,
  handleBaseLineCorrectionFilter,
  filterSnapshotHandler,
};
