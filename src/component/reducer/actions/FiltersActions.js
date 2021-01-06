import { produce } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { apply as autoPhaseCorrection } from '../../../data/data1d/filter1d/autoPhaseCorrection';
import { apply as phaseCorrection } from '../../../data/data1d/filter1d/phaseCorrection';
import { options } from '../../toolbar/ToolTypes';
import { AnalysisObj } from '../core/Analysis';
import getClosestNumber from '../helper/GetClosestNumber';

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
const applyAbsoluteFilter = (state) => {
  return produce(state, (draft) => {
    const { id } = draft.activeSpectrum;

    const activeObject = AnalysisObj.getDatum(id);
    activeObject.applyFilter([{ name: Filters.absolute.id, options: {} }]);

    setDataByFilters(draft, activeObject, id);
    draft.dataSnapshot = null;
    draft.tempData = null;
    setDomain(draft);
  });
};

const applyAutoPhaseCorrectionFilter = (state) => {
  return produce(state, (draft) => {
    const { tempData } = state;
    const { index } = state.activeSpectrum;
    const { x, y, im, info } = tempData[index];
    const { id } = draft.activeSpectrum;

    const activeObject = AnalysisObj.getDatum(id);

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
  });
};

const calculateManualPhaseCorrection = (state, filterOptions) => {
  return produce(state, (draft) => {
    const { tempData } = state;
    const { index } = state.activeSpectrum;
    const { x, y, im, info } = tempData[index];

    let { ph0, ph1 } = filterOptions;
    const closest = getClosestNumber(tempData[index].x, state.pivot);
    const pivotIndex = tempData[index].x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / y.length;

    let _data = { data: { x, re: y, im }, info };
    phaseCorrection(_data, { ph0, ph1 });
    const { im: newIm, re: newRe } = _data.data;
    draft.tempData[index].im = newIm;
    draft.tempData[index].y = newRe;
  });
};

const enableFilter = (state, filterID, checked) => {
  const activeSpectrumId = state.activeSpectrum.id;
  const activeObject = AnalysisObj.getDatum(activeSpectrumId);
  //apply filter into the spectrum
  activeObject.enableFilter(filterID, checked);

  const XYData = activeObject.getReal();
  const spectrumIndex = state.data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );

  return produce(state, (draft) => {
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
    draft.data[spectrumIndex].info = activeObject.info;

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

const filterSnapshotHandler = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum && state.activeSpectrum.id) {
      const { id } = state.activeSpectrum;
      const activeObject = AnalysisObj.getDatum(id);

      activeObject.applyFilterSnapshot(action.id);

      setDataByFilters(draft, activeObject, id);
      setDomain(draft);
      setMode(draft);
    }
  });
};

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
