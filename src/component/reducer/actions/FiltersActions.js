import { produce } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { apply } from '../../../data/data1d/filter1d/phaseCorrection';
import { options } from '../../toolbar/ToolTypes';
import { AnalysisObj } from '../core/Analysis';
import getClosestNumber from '../helper/GetClosestNumber';

import { setDomain, setMode } from './DomainActions';
import { setYAxisShift } from './ToolsActions';

function setDataByFilters(draft, activeObject, activeSpectrumId) {
  const { x, re, im } = activeObject.getData();
  const spectrumIndex = draft.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );
  draft.selectedOptionPanel = null;
  draft.selectedTool = options.zoom.id;
  draft.data[spectrumIndex].x = x;
  draft.data[spectrumIndex].y = re;
  draft.data[spectrumIndex].im = im;
  draft.data[spectrumIndex].filters = activeObject.getFilters();
  draft.data[spectrumIndex].info = activeObject.getInfo();
}

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  return produce(state, (draft) => {
    //apply filter into the spectrum
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);
    activeObject.applyFilter([
      { name: Filters.shiftX.id, options: shiftValue },
    ]);
    setDataByFilters(draft, activeObject, activeSpectrumId);
    setDomain(draft);
  });
};

const applyZeroFillingFilter = (state, filterOptions) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);

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
  });
};
const applyFFTFilter = (state) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    //apply filter into the spectrum
    activeObject.applyFilter([{ name: Filters.fft.id, options: {} }]);

    setDataByFilters(draft, activeObject, activeSpectrumId);
    setYAxisShift([{ info: activeObject.getInfo() }], draft, state.height);

    setDomain(draft);
    setMode(draft);
  });
};
const applyManualPhaseCorrectionFilter = (state, filterOptions) => {
  return produce(state, (draft) => {
    const { id, index } = draft.activeSpectrum;
    // draft.data = AnalysisObj.getSpectraData();
    let { ph0, ph1 } = filterOptions;

    const activeObject = AnalysisObj.getDatum(id);
    const closest = getClosestNumber(draft.data[index].x, state.pivot);
    const pivotIndex = draft.data[index].x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / draft.data[index].y.length;

    activeObject.applyFilter([
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    setDataByFilters(draft, activeObject, id);
    draft.dataSnapshot = null;
    draft.tempData = null;
    setDomain(draft);
  });
};

const calculateManualPhaseCorrection = (state, filterOptions) => {
  return produce(state, (draft) => {
    const { tempData } = state;
    const { index } = state.activeSpectrum;
    const { x, y, im, info } = tempData[index];

    let { ph0, ph1 } = filterOptions;
    // const activeObject = AnalysisObj.getDatum(id);
    const closest = getClosestNumber(tempData[index].x, state.pivot);
    const pivotIndex = tempData[index].x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / y.length;

    let _data = { data: { x, re: y, im }, info };
    apply(_data, { ph0, ph1 });
    const { im: newIm, re: newRe } = _data.data;
    draft.tempData[index].im = newIm;
    draft.tempData[index].y = newRe;
  });
};

const enableFilter = (state, filterID, checked) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);
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
  });
};

const deleteFilter = (state, filterID) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    //apply filter into the spectrum
    activeObject.deleteFilter(filterID);

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
  });
};

const handleBaseLineCorrectionFilter = (state, action) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    activeObject.applyFilter([
      {
        name: Filters.baselineCorrection.id,
        options: { zones: state.baseLineZones, ...action.options },
      },
    ]);
    draft.baseLineZones = [];
    const xDomainSnapshot = draft.xDomain.slice();

    setDataByFilters(draft, activeObject, activeSpectrumId);
    setDomain(draft);
    draft.xDomain = xDomainSnapshot;
  });
};

export {
  shiftSpectrumAlongXAxis,
  applyZeroFillingFilter,
  applyFFTFilter,
  applyManualPhaseCorrectionFilter,
  calculateManualPhaseCorrection,
  enableFilter,
  deleteFilter,
  handleBaseLineCorrectionFilter,
};
