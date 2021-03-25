import { Draft } from 'immer';

import {
  Datum1D,
  updatePeaksXShift,
  updateRangesXShift,
  updateIntegralXShift,
  getShiftX,
} from '../../../data/data1d/Datum1D';
import * as FiltersManager from '../../../data/data1d/FiltersManager';
import { Filters } from '../../../data/data1d/filter1d/Filters';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { options } from '../../toolbar/ToolTypes';
import { State } from '../Reducer';
import getClosestNumber from '../helper/GetClosestNumber';
import ZoomHistory from '../helper/ZoomHistory';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';

function updateXShift(datum: Datum1D, isDeleted = false) {
  const filter = getShiftX(datum);
  if (filter) {
    const shiftX = filter.flag && !isDeleted ? filter.value : 0;
    updatePeaksXShift(datum, shiftX);
    updateRangesXShift(datum, shiftX);
    updateIntegralXShift(datum, shiftX);
  }
}

function setDataByFilters(draft: Draft<State>, hideOptionPanel = true) {
  if (hideOptionPanel) {
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
  }
  const datum = draft.data[draft.activeSpectrum.index] as Datum1D;
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
    setDataByFilters(draft);
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
    setDataByFilters(draft);
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
    setDataByFilters(draft);
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

    setDataByFilters(draft);
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
    setDataByFilters(draft);
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
    setDataByFilters(draft);
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

    updateXShift(draft.data[index] as Datum1D);
    setDataByFilters(draft, false);
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

function deleteFilter(draft: Draft<State>, filterID) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    updateXShift(draft.data[index] as Datum1D, true);
    //apply filter into the spectrum
    FiltersManager.deleteFilter(draft.data[index], filterID);

    setDataByFilters(draft, false);
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

    setDataByFilters(draft);
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

    setDataByFilters(draft);
    setDomain(draft);
    setMode(draft);
  }
}

export {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  applyAutoPhaseCorrectionFilter,
  applyAbsoluteFilter,
  calculateManualPhaseCorrection,
  enableFilter,
  deleteFilter,
  handleBaseLineCorrectionFilter,
  filterSnapshotHandler,
};
