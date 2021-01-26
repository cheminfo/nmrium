import { original } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { options } from '../../toolbar/ToolTypes';
import getClosestNumber from '../helper/GetClosestNumber';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setDomain, setMode } from './DomainActions';
import { setYAxisShift } from './ToolsActions';

function setDataByFilters(
  draft,
  activeObject,
  activeSpectrumId,
  hideOptionPanel = true,
) {
  const { x, re, im } = activeObject.getData();
  const spectrumIndex = draft.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );
  if (hideOptionPanel) {
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
  }
  draft.data[spectrumIndex].x = x;
  draft.data[spectrumIndex].y = re;
  draft.data[spectrumIndex].im = im;
  draft.data[spectrumIndex].filters = activeObject.getFilters();
  draft.data[spectrumIndex].info = activeObject.getInfo();
}

function shiftSpectrumAlongXAxis(draft, shiftValue) {
  //apply filter into the spectrum
  const activeSpectrumId = draft.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);
  activeObject.applyFilter([{ name: Filters.shiftX.id, options: shiftValue }]);
  setDataByFilters(draft, activeObject, activeSpectrumId);
  setDomain(draft);
}

function applyZeroFillingFilter(draft, filterOptions) {
  const activeSpectrumId = draft.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);

  activeObject.applyFilter([
    { name: Filters.zeroFilling.id, options: filterOptions.zeroFillingSize },
    {
      name: Filters.lineBroadening.id,
      options: filterOptions.lineBroadeningValue,
    },
  ]);

  setDataByFilters(draft, activeObject, activeSpectrumId);
  setDomain(draft);
  setMode(draft);
}
function applyFFTFilter(draft) {
  const activeSpectrumId = draft.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);

  //apply filter into the spectrum
  activeObject.applyFilter([{ name: Filters.fft.id, options: {} }]);

  setDataByFilters(draft, activeObject, activeSpectrumId);
  setYAxisShift([{ info: activeObject.getInfo() }], draft, draft.height);

  setDomain(draft);
  setMode(draft);
}
function applyManualPhaseCorrectionFilter(draft, filterOptions) {
  const { id, index } = draft.activeSpectrum;
  let { ph0, ph1 } = filterOptions;

  const activeObject = draft.AnalysisObj.getDatum(id);
  const closest = getClosestNumber(draft.data[index].x, draft.pivot);
  const pivotIndex = draft.data[index].x.indexOf(closest);

  ph0 = ph0 - (ph1 * pivotIndex) / draft.data[index].y.length;

  activeObject.applyFilter([
    { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
  ]);

  setDataByFilters(draft, activeObject, id);
  draft.dataSnapshot = null;
  draft.tempData = null;
  setDomain(draft);
}
function applyAbsoluteFilter(draft) {
  const { id } = draft.activeSpectrum;

  const activeObject = draft.AnalysisObj.getDatum(id);
  activeObject.applyFilter([{ name: Filters.absolute.id, options: {} }]);

  setDataByFilters(draft, activeObject, id);
  draft.dataSnapshot = null;
  draft.tempData = null;
  setDomain(draft);
}

function applyAutoPhaseCorrectionFilter(draft) {
  const { tempData } = draft;
  const { index, id } = draft.activeSpectrum;
  const { x, y, im, info } = tempData[index];

  const activeObject = draft.AnalysisObj.getDatum(id);

  let _data = { data: { x, re: y, im }, info };
  const { data, ph0, ph1 } = autoPhaseCorrection(_data);

  const { im: newIm, re: newRe } = data;
  draft.tempData[index].im = newIm;
  draft.tempData[index].y = newRe;

  activeObject.applyFilter([
    { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
  ]);

  setDataByFilters(draft, activeObject, id, false);
  setDomain(draft);
}

function calculateManualPhaseCorrection(draft, filterOptions) {
  const { tempData } = draft;
  const { index } = draft.activeSpectrum;
  const { x, y, im, info } = tempData[index];

  let { ph0, ph1 } = filterOptions;
  const closest = getClosestNumber(tempData[index].x, draft.pivot);
  const pivotIndex = tempData[index].x.indexOf(closest);

  ph0 = ph0 - (ph1 * pivotIndex) / y.length;

  let _data = { data: { x, re: y, im }, info };
  phaseCorrection(_data, { ph0, ph1 });
  const { im: newIm, re: newRe } = _data.data;
  draft.tempData[index].im = newIm;
  draft.tempData[index].y = newRe;
}

function enableFilter(draft, filterID, checked) {
  const state = original(draft);
  const activeSpectrumId = draft.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);
  //apply filter into the spectrum
  activeObject.enableFilter(filterID, checked);

  const XYData = activeObject.getReal();
  const spectrumIndex = state.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );

  draft.data[spectrumIndex].x = XYData.x;
  draft.data[spectrumIndex].y = XYData.y;
  draft.data[spectrumIndex].filters = activeObject.getFilters();
  draft.data[spectrumIndex].info.isFid = activeObject.info.isFid;

  setDomain(draft);
  setMode(draft);

  const zoomHistory = HorizontalZoomHistory.getInstance(draft.activeTab);
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
}

function deleteFilter(draft, filterID) {
  const state = original(draft);
  const activeSpectrumId = state.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);

  //apply filter into the spectrum
  activeObject.deleteFilter(filterID);

  const XYData = activeObject.getReal();

  const spectrumIndex = state.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );

  draft.data[spectrumIndex].x = XYData.x;
  draft.data[spectrumIndex].y = XYData.y;
  draft.data[spectrumIndex].filters = activeObject.getFilters();
  draft.data[spectrumIndex].info = activeObject.info;

  setDomain(draft);
  setMode(draft);
}

function handleBaseLineCorrectionFilter(draft, action) {
  const activeSpectrumId = draft.activeSpectrum.id;
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);

  activeObject.applyFilter([
    {
      name: Filters.baselineCorrection.id,
      options: { zones: draft.baseLineZones, ...action.options },
    },
  ]);
  draft.baseLineZones = [];
  const xDomainSnapshot = draft.xDomain.slice();

  setDataByFilters(draft, activeObject, activeSpectrumId);
  setDomain(draft);
  draft.xDomain = xDomainSnapshot;
}

function filterSnapshotHandler(draft, action) {
  if (draft.activeSpectrum && draft.activeSpectrum.id) {
    const { id } = draft.activeSpectrum;
    const activeObject = draft.AnalysisObj.getDatum(id);

    activeObject.applyFilterSnapshot(action.id);

    setDataByFilters(draft, activeObject, id);
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
