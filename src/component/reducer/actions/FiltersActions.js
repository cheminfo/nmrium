import { produce } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { options } from '../../toolbar/ToolTypes';
import { AnalysisObj } from '../core/Analysis';
import getClosestNumber from '../helper/GetClosestNumber';
import { apply, reduce } from '../../../data/data1d/filter1d/phaseCorrection';

import { setDomain, setMode } from './DomainActions';
import { setYAxisShift } from './ToolsActions';

function setDataByFilters(draft, activeObject, activeSpectrumId) {
  const XYData = activeObject.getReal();
  const spectrumIndex = draft.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );
  draft.selectedOptionPanel = null;
  draft.selectedTool = options.zoom.id;
  draft.data[spectrumIndex].x = XYData.x;
  draft.data[spectrumIndex].y = XYData.y;
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
    AnalysisObj.clearDataSnapshot();
    draft.data = AnalysisObj.getSpectraData();

    const activeObject = AnalysisObj.getDatum(id);

    activeObject.applyFilter([
      { name: Filters.phaseCorrection.id, options: filterOptions },
    ]);
    activeObject.reapplyFilters();
    const XYData = activeObject.getReal();

    draft.data[index].x = XYData.x;
    draft.data[index].y = XYData.y;
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
    draft.dataSnapshot = null;
    draft.data[index].filters = activeObject.getFilters();
    setDomain(draft);
  });
};
let previousPhaseCorrectionOptions = { ph0: 0, ph1: 0 };
const calculateManualPhaseCorrection = (state, filterOptions) => {
  return produce(state, (draft) => {
    const { data } = state;
    const { id, index } = state.activeSpectrum;
    const { x, y, im, info } = draft.data[index];

    let { ph0, ph1 } = filterOptions;
    const activeObject = AnalysisObj.getDatum(id);
    const closest = getClosestNumber(data[index].x, state.pivot);
    const pivotIndex = data[index].x.indexOf(closest);

    
    
    ph0 = ph0 - (ph1 * pivotIndex) / y.length;
    
    // if you use previous values you need to apply the filter on original data
    // const phaseCorrectionOptions = reduce(previousPhaseCorrectionOptions, {
    //   ph0,
    //   ph1,
    // }).reduce;
    let _data = { data: { x, re: y, im }, info };
    apply(_data, {ph0, ph1});
    const { x: newX, re: newRe } = _data.data;
    draft.data[index].x = newX;
    draft.data[index].y = newRe;
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
