import * as FiltersManager from '../../../data/data1d/FiltersManager';
import { Filters } from '../../../data/data1d/filter1d/Filters';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { options } from '../../toolbar/ToolTypes';
import getClosestNumber from '../helper/GetClosestNumber';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setDomain, setMode } from './DomainActions';
import { setYAxisShift } from './ToolsActions';

function setDataByFilters(draft, hideOptionPanel = true) {
  if (hideOptionPanel) {
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
  }
  draft.data[draft.activeSpectrum.index].data.y =
    draft.data[draft.activeSpectrum.index].data.re;
}

function shiftSpectrumAlongXAxis(draft, shiftValue) {
  //apply filter into the spectrum
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, options: shiftValue },
    ]);
    setDataByFilters(draft);
    setDomain(draft);
  }
}

function applyZeroFillingFilter(draft, filterOptions) {
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
function applyFFTFilter(draft) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    // const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    //apply filter into the spectrum
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.fft.id, options: {} },
    ]);

    setDataByFilters(draft);
    setYAxisShift(draft, draft.height);

    setDomain(draft);
    setMode(draft);
  }
}
function applyManualPhaseCorrectionFilter(draft, filterOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    let { ph0, ph1 } = filterOptions;

    const closest = getClosestNumber(draft.data[index].x, draft.pivot);
    const pivotIndex = draft.data[index].data.x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / draft.data[index].data.y.length;

    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    setDataByFilters(draft);
    draft.dataSnapshot = null;
    draft.tempData = null;
    setDomain(draft);
  }
}
function applyAbsoluteFilter(draft) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.absolute.id, options: {} },
    ]);
    setDataByFilters(draft);
    draft.dataSnapshot = null;
    draft.tempData = null;
    setDomain(draft);
  }
}

function applyAutoPhaseCorrectionFilter(draft) {
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
    setDomain(draft);
  }
}

function calculateManualPhaseCorrection(draft, filterOptions) {
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

function enableFilter(draft, filterID, checked) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    //apply filter into the spectrum
    FiltersManager.enableFilter(draft.data[index], filterID, checked);

    setDataByFilters(draft, false);
    setDomain(draft);
    setMode(draft);

    const zoomHistory = HorizontalZoomHistory.getInstance(draft.activeTab);
    const zoomValue = zoomHistory.getLast();
    if (zoomValue) {
      draft.xDomain = zoomValue.xDomain;
      draft.yDomain = zoomValue.yDomain;
    }
  }
}

function deleteFilter(draft, filterID) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    //apply filter into the spectrum
    FiltersManager.deleteFilter(draft.data[index], filterID);
    setDataByFilters(draft, false);
    setDomain(draft);
    setMode(draft);
  }
}

function handleBaseLineCorrectionFilter(draft, action) {
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

function filterSnapshotHandler(draft, action) {
  if (draft.activeSpectrum?.id) {
    const index = draft.activeSpectrum.index;

    if (action.id) {
      const filterIndex = draft.data[index].filters.findIndex(
        (f) => f.id === action.id,
      );
      const filters = draft.data[index].filters.slice(0, filterIndex + 1);
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
