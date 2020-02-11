import { produce } from 'immer';
import * as d3 from 'd3';
import max from 'ml-array-max';

import { Datum1D } from '../../data/data1d/Datum1D';
import getColor from '../utility/ColorGenerator';
import { Analysis } from '../../data/Analysis';
import { Filters } from '../../data/data1d/filter1d/Filters';
import { options } from '../toolbar/ToolTypes';
import {
  exportAsSVG,
  exportAsJSON,
  exportAsPng,
  copyPNGToClipboard,
} from '../utility/Export';
import GroupByInfoKey from '../utility/GroupByInfoKey';
import generateID from '../../data/utilities/generateID';

import { UNDO, REDO, RESET } from './HistoryActions';
import {
  INITIATE,
  ADD_PEAK,
  ADD_PEAKS,
  AUTO_PEAK_PICKING,
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
  LOAD_JCAMP_FILE,
  LOAD_JSON_FILE,
  LOAD_MOL_FILE,
  SET_DATA,
  SET_ORIGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_WIDTH,
  SET_DIMENSIONS,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  ADD_INTEGRAL,
  DELETE_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
  SET_ZOOM_FACTOR,
  ADD_MOLECULE,
  SET_MOLECULE,
  DELETE_MOLECULE,
  DELETE_SPECTRA,
  CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  SET_INTEGRAL_Y_DOMAIN,
  RESIZE_INTEGRAL,
  BRUSH_END,
  RESET_DOMAIN,
  CHANGE_INTEGRAL_ZOOM,
  ENABLE_FILTER,
  DELETE_FILTER,
  APPLY_ZERO_FILLING_FILTER,
  APPLY_FFT_FILTER,
  SET_VERTICAL_INDICATOR_X_POSITION,
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  SET_SELECTED_OPTIONS_PANEL,
  SET_LOADING_FLAG,
  RESET_SELECTED_TOOL,
  AUTO_RANGES_DETECTION,
  DELETE_RANGE,
  SET_SPECTRUMS_VERTICAL_ALIGN,
  CHANGE_INTEGRAL_DATA,
  EXPORT_DATA,
  SET_PREFERENCES,
  SET_ACTIVE_TAB,
  CHANGE_INTEGRAL_SUM,
  ADD_BASE_LINE_ZONE,
  DELETE_BASE_LINE_ZONE,
  APPLY_BASE_LINE_CORRECTION_FILTER,
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  LOAD_ZIP_FILE,
} from './Actions';

let AnalysisObj = new Analysis();
const DEFAULT_YAXIS_SHIFT_VALUE = 20;
function setIsLoading(state, isLoading) {
  return { ...state, isLoading };
}

function getStrongestPeak(state) {
  const { activeSpectrum, data } = state;

  const activeSpectrumId = activeSpectrum.id;
  const activeData = data.find((d) => d.id === activeSpectrumId);
  const strongestPeakValue = max(activeData.y);
  const index = activeData.y.findIndex((val) => val === strongestPeakValue);
  return {
    xValue: activeData.x[index],
    yValue: strongestPeakValue,
    index: index,
  };
}

function getDomain(data) {
  let xArray = data.reduce((acc, d) => {
    return d.isVisibleInDomain
      ? acc.concat([d.x[0], d.x[d.x.length - 1]])
      : acc.concat([]);
  }, []);
  let yDomains = {};
  let integralsYDomains = {};
  let yArray = data.reduce((acc, d) => {
    const extent = d3.extent(d.y);
    yDomains[d.id] = extent;
    integralsYDomains[d.id] = extent;
    return acc.concat(extent);
  }, []);

  return {
    x: d3.extent(xArray),
    y: d3.extent(yArray),
    yDomains,
    integralsYDomains,
  };
}

const getScale = ({ xDomain, yDomain, width, height, margin, mode }) => {
  const xRange =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];

  const x = d3.scaleLinear(xDomain, xRange);
  const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  return { x, y };
};

function setYAxisShit(data, draft, height) {
  if (data && data.length > 0) {
    if (data[0].info.isFid && !data.some((d) => d.info.isFid === false)) {
      const YAxisShift = height / 2;
      draft.verticalAlign.flag = true;
      draft.verticalAlign.value = YAxisShift;
      draft.verticalAlign.stacked = false;
    } else {
      draft.verticalAlign.flag = false;
      draft.verticalAlign.value = DEFAULT_YAXIS_SHIFT_VALUE;
      draft.verticalAlign.stacked = false;
    }
  }
}
const changeSpectrumDisplayPreferences = (state, draft, { center }) => {
  const { height } = state;
  if (center) {
    const YAxisShift = height / 2;
    draft.verticalAlign.flag = true;
    draft.verticalAlign.value = YAxisShift;
    draft.verticalAlign.stacked = false;
    AnalysisObj.setPreferences({ display: { center: true } });
  } else {
    draft.verticalAlign.flag = false;
    draft.verticalAlign.value = DEFAULT_YAXIS_SHIFT_VALUE;
    draft.verticalAlign.stacked = false;
    AnalysisObj.setPreferences({ display: { center: false } });
  }
};

const setSpectrumsVerticalAlign = (state, flag) => {
  return produce(state, (draft) => {
    changeSpectrumDisplayPreferences(state, draft, { center: flag });
  });
};

const initiate = (state, dataObject) => {
  return produce(state, (draft) => {
    AnalysisObj = dataObject.AnalysisObj;
    const spectraData = AnalysisObj.getSpectraData();
    const domain = getDomain(spectraData);
    draft.data = spectraData;
    draft.molecules = AnalysisObj.getMolecules();
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
    draft.isLoading = false;
    const preferences = AnalysisObj.getPreferences('1d');
    if (
      preferences.display &&
      Object.prototype.hasOwnProperty.call(preferences.display, 'center')
    ) {
      changeSpectrumDisplayPreferences(state, draft, {
        center: preferences.display.center,
      });
    } else {
      setYAxisShit(spectraData, draft, state.height);
    }
    setMode(draft);
  });
};

const exportData = (state, { exportType }) => {
  const { data } = state;
  //check if there is data to export it
  if (data.length > 0) {
    //exported file name by default will be the first spectrum name
    const fileName = data[0].name;

    switch (exportType) {
      case 'json': {
        const exportedData = AnalysisObj.toJSON();
        exportAsJSON(exportedData, fileName);
        break;
      }
      case 'svg': {
        exportAsSVG(fileName, 'nmrSVG');
        break;
      }
      case 'png': {
        exportAsPng(fileName, 'nmrSVG');
        break;
      }
      case 'copy': {
        copyPNGToClipboard('nmrSVG');
        break;
      }
      default:
        break;
    }
  }
  return state;
};

const setData = (state, data) => {
  // AnalysisObj= new Analysis()
  return produce(state, (draft) => {
    for (let d of data) {
      AnalysisObj.pushDatum(new Datum1D(d));
    }
    draft.data = AnalysisObj.getSpectraData();
    draft.molecules = AnalysisObj.getMolecules();

    draft.isLoading = false;
    setDomain(draft);
    setMode(draft);
  });
};

const loadJcampFile = (state, files) => {
  return produce(state, (draft) => {
    let usedColors = draft.data.map((d) => d.color);
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      const color = getColor(usedColors);
      AnalysisObj.addJcamp(files[i].binary.toString(), {
        display: {
          name: files[i].name,
          color: color,
          isVisible: true,
          isPeaksMarkersVisible: true,
        },
        source: {
          jcampURL: files[i].jcampURL ? files[i].jcampURL : null,
        },
      });
      usedColors.push(color);
    }
    draft.data = AnalysisObj.getSpectraData();
    setDomain(draft);
    setMode(draft);
    draft.isLoading = false;
  });
};

const handleLoadJsonFile = (state, data) => {
  return produce(state, (draft) => {
    AnalysisObj = data.AnalysisObj;
    const spectraData = AnalysisObj.getSpectraData();
    draft.data = spectraData;
    draft.molecules = AnalysisObj.getMolecules();
    const preferences = AnalysisObj.getPreferences('1d');
    draft.preferences = preferences;
    if (
      preferences.display &&
      Object.prototype.hasOwnProperty.call(preferences.display, 'center')
    ) {
      changeSpectrumDisplayPreferences(state, draft, {
        center: preferences.display.center,
      });
    } else {
      setYAxisShit(spectraData, draft, state.height);
    }

    setDomain(draft);
    setMode(draft);
    draft.isLoading = false;
  });
};

const handleLoadMOLFile = (state, files) => {
  return produce(state, (draft) => {
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      AnalysisObj.addMolfile(files[i].binary.toString());
    }
    draft.molecules = AnalysisObj.getMolecules();
    draft.isLoading = false;
  });
};
const handleLoadZIPFile = (state, files) => {
  AnalysisObj.fromZip(files);
  return state;
};

const getClosePeak = (xShift, mouseCoordinates, state) => {
  const scale = getScale(state);
  const { activeSpectrum } = state;
  const start = scale.x.invert(mouseCoordinates.x - xShift);
  const end = scale.x.invert(mouseCoordinates.x + xShift);
  const range = [];
  if (start > end) {
    range[0] = end;
    range[1] = start;
  } else {
    range[0] = start;
    range[1] = end;
  }

  const closePeak = AnalysisObj.getDatum(activeSpectrum.id).lookupPeak(
    range[0],
    range[1],
  );
  return closePeak;
};

const addPeak = (state, mouseCoordinates) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;

      const index = state.data.findIndex((d) => d.id === spectrumID);
      const candidatePeak = getClosePeak(10, mouseCoordinates, state);

      if (index !== -1) {
        const peak = { xIndex: candidatePeak.xIndex };
        AnalysisObj.getDatum(spectrumID).addPeak(peak);
        draft.data[index].peaks = AnalysisObj.getDatum(spectrumID).getPeaks();
      }
    }
  });
};

const addPeaks = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;
      const index = state.data.findIndex((d) => d.id === spectrumID);

      const scale = getScale(state);

      const start = scale.x.invert(action.startX);
      const end = scale.x.invert(action.endX);
      const range = [];
      if (start > end) {
        range[0] = end;
        range[1] = start;
      } else {
        range[0] = start;
        range[1] = end;
      }

      if (index !== -1) {
        const peaks = AnalysisObj.getDatum(spectrumID).addPeaks(
          range[0],
          range[1],
        );
        draft.data[index].peaks = peaks;
      }
    }
  });
};

const deletePeak = (state, peakData) => {
  return produce(state, (draft) => {
    const { id, index } = state.activeSpectrum;
    const object = AnalysisObj.getDatum(id);
    object.deletePeak(peakData);
    draft.data[index].peaks = object.getPeaks();
  });
};

const setIntegralZoom = (state, zoomFactor, draft) => {
  if (draft.activeSpectrum) {
    const { originDomain, height, margin } = state;
    const scale = d3.scaleLinear(
      originDomain.yDomains[draft.activeSpectrum.id],
      [height - margin.bottom, margin.top],
    );
    const t = d3.zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(zoomFactor.scale * 5)
      .translate(0, -(height - margin.bottom));

    const newYDomain = t.rescaleY(scale).domain();

    draft.integralZoomFactor = zoomFactor;
    const activeSpectrum = draft.activeSpectrum;
    // draft.zoomFactor = t;
    draft.integralsYDomains[activeSpectrum.id] = newYDomain;
  }
};

const handleChangeIntegralZoom = (state, zoomFactor) => {
  return produce(state, (draft) => {
    setIntegralZoom(state, zoomFactor, draft);
  });
};

const addIntegral = (state, action) => {
  const scale = getScale(state).x;

  return produce(state, (draft) => {
    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);

    let integralRange = [];
    if (start > end) {
      integralRange = [end, start];
    } else {
      integralRange = [start, end];
    }

    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.addIntegral(integralRange);
      draft.data[index].integrals = datumObject.getIntegrals();

      setIntegralZoom(state, state.integralZoomFactor, draft);
      // if (!state.data.integralsYDomain) {
      //   draft.data[index].integralsYDomain = draft.yDomain;
      // }
    }
  });
};

const deleteIntegral = (state, action) => {
  return produce(state, (draft) => {
    const { integralID } = action;
    const { id, index } = state.activeSpectrum;
    const object = AnalysisObj.getDatum(id);
    object.deleteIntegral(integralID);
    draft.data[index].integrals = object.getIntegrals();
  });
};

const changeIntegral = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.setIntegral(action.data);
      draft.data[index].integrals = datumObject.getIntegrals();
    }
  });
};

const handleResizeIntegral = (state, integralData) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeIntegral(integralData);
      draft.data[index].integrals = datumObject.getIntegrals();
    }
  });
};

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
    setYAxisShit([{ info: activeObject.getInfo() }], draft, state.height);

    setDomain(draft);
    setMode(draft);
  });
};
const applyManualPhaseCorrectionFilter = (state) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum(activeSpectrumId);

    const spectrumIndex = state.tempData.findIndex(
      (spectrum) => spectrum.id === activeSpectrumId,
    );
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
    draft.tempData = null;
    draft.data[spectrumIndex].filters = activeObject.getFilters();
    setDomain(draft);
  });
};

const calculateManualPhaseCorrection = (state, filterOptions) => {
  return produce(state, (draft) => {
    const { data } = state;
    const { id, index } = state.activeSpectrum;
    let { ph0, ph1 } = filterOptions;
    const activeObject = AnalysisObj.getDatum(id);
    const closest = getClosestNumber(data[index].x, state.pivot);
    const pivotIndex = data[index].x.indexOf(closest);

    ph0 = ph0 - (ph1 * pivotIndex) / activeObject.data.x.length;
    activeObject.applyFilter([
      { name: Filters.phaseCorrection.id, options: { ph0, ph1 } },
    ]);

    const XYData = activeObject.getReal();

    draft.data[index].x = XYData.x;
    draft.data[index].y = XYData.y;
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

const setOriginalDomain = (state, originDomain) => {
  return produce(state, (draft) => {
    draft.originDomain = originDomain;
  });
};

const setXDomain = (state, xDomain) => {
  return produce(state, (draft) => {
    draft.xDomain = xDomain;
  });
};

const setWidth = (state, width) => {
  return { ...state, width };
};

const handleSetDimensions = (state, width, height) => {
  return { ...state, width, height };
};

const setPointerCoordinates = (state, pointerCoordinates) => {
  return { ...state, pointerCoordinates };
};

const resetSelectedTool = (state) => {
  return produce(state, (draft) => {
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
    draft.baseLineZones = [];
    if (state.tempData) {
      draft.data = state.tempData;
      draft.tempData = null;
      setDomain(draft);
    }
  });
};

const setSelectedTool = (state, selectedTool) => {
  return produce(state, (draft) => {
    if (selectedTool) {
      draft.selectedTool = selectedTool;
      if (options[selectedTool].hasOptionPanel) {
        draft.selectedOptionPanel = selectedTool;
      } else {
        draft.selectedOptionPanel = null;
      }
      if (options[selectedTool].isFilter) {
        setFilterChanges(draft, state, selectedTool);
      }
    } else {
      draft.selectedTool = null;
      if (options[state.selectedTool].hasOptionPanel) {
        draft.selectedOptionPanel = null;
      }
    }
  });
};
const setSelectedOptionPanel = (state, selectedOptionPanel) => {
  return { ...state, selectedOptionPanel };
};

function setFilterChanges(draft, state, selectedFilter) {
  draft.tempData = state.data;
  //select the equalizer tool when you enable manual phase correction filter
  if (selectedFilter === Filters.phaseCorrection.id) {
    const { xValue } = getStrongestPeak(state);
    draft.pivot = xValue;
  } else {
    if (draft.selectedTool === options.phaseCorrection.id) {
      const activeSpectrumId = state.activeSpectrum.id;

      const spectrumIndex = draft.data.findIndex(
        (spectrum) => spectrum.id === activeSpectrumId,
      );

      const activeObject = AnalysisObj.getDatum(activeSpectrumId);
      activeObject.data.x = state.tempData[spectrumIndex].x;
      activeObject.data.re = state.tempData[spectrumIndex].y;
      activeObject.data.im = state.tempData[spectrumIndex].im;

      draft.data[spectrumIndex].x = state.tempData[spectrumIndex].x;
      draft.data[spectrumIndex].y = state.tempData[spectrumIndex].y;
      draft.tempData = null;
      draft.selectedTool = null;
      setDomain(draft);
    }
  }
}

const handleSpectrumVisibility = (state, data) => {
  return produce(state, (draft) => {
    for (let datum of draft.data) {
      if (data.some((sData) => sData.id === datum.id)) {
        datum.isVisible = true;
      } else {
        datum.isVisible = false;
      }
    }
  });
};

const handleChangePeaksMarkersVisibility = (state, data) => {
  return produce(state, (draft) => {
    for (let datum of draft.data) {
      if (data.some((activeData) => activeData.id === datum.id)) {
        AnalysisObj.getDatum(datum.id).isPeaksMarkersVisible = true;
        datum.isPeaksMarkersVisible = true;
      } else {
        AnalysisObj.getDatum(datum.id).isPeaksMarkersVisible = false;
        datum.isPeaksMarkersVisible = false;
      }
    }
  });
};

const handleChangeActiveSpectrum = (state, activeSpectrum) => {
  return produce(state, (draft) => {
    if (activeSpectrum) {
      AnalysisObj.getDatum(activeSpectrum.id).isVisible = true;
      const index = draft.data.findIndex((d) => d.id === activeSpectrum.id);
      if (index !== -1) {
        draft.data[index].isVisible = true;
      }

      activeSpectrum = { ...activeSpectrum, index };
      draft.activeSpectrum = activeSpectrum;
    } else {
      draft.activeSpectrum = null;
    }
    setDomain(draft, false);
    setMode(draft);
  });
};

const handleChangeSpectrumColor = (state, { id, color }) => {
  return produce(state, (draft) => {
    const index = draft.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      draft.data[index].color = color;
      AnalysisObj.getDatum(id).display.color = color;
    }
  });
};

const handleToggleRealImaginaryVisibility = (state) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum === null) return;
    const activeSpectrumId = state.activeSpectrum.id;
    const ob = AnalysisObj.getDatum(activeSpectrumId);

    if (ob) {
      const reY = ob.getReal().y;
      const imY = ob.getImaginary().y;
      const index = state.data.findIndex((d) => d.id === activeSpectrumId);
      ob.setIsRealSpectrumVisible(!draft.data[index]);

      draft.data[index].isRealSpectrumVisible = !draft.data[index]
        .isRealSpectrumVisible;
      ob.setIsRealSpectrumVisible();
      // isRealSpectrumVisible
      if (draft.data[index].isRealSpectrumVisible) {
        if (reY !== null && reY !== undefined) {
          draft.data[index].y = reY;
          const domain = getDomain(draft.data);
          draft.xDomain = domain.x;
          draft.yDomain = domain.y;
          draft.yDomains = domain.yDomains;
        }
      } else {
        if (imY !== null && imY !== undefined) {
          draft.data[index].y = imY;
          const domain = getDomain(draft.data);
          draft.xDomain = domain.x;
          draft.yDomain = domain.y;
          draft.yDomains = domain.yDomains;
        }
      }
    }
  });
};

const getClosestNumber = (array = [], goal = 0) => {
  const closest = array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
  return closest;
};

const setZoom = (state, draft, zoomFactor) => {
  const { originDomain, height, margin, data } = state;
  let t;
  if (data.length === 1) {
    const closest = getClosestNumber(data[0].y);
    const referencePoint = getScale(state).y(closest);
    t = d3.zoomIdentity
      .translate(0, referencePoint)
      .scale(zoomFactor.scale)
      .translate(0, -referencePoint);
  } else {
    t = d3.zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(zoomFactor.scale)
      .translate(0, -(height - margin.bottom));
  }

  draft.zoomFactor = zoomFactor;

  if (draft.activeSpectrum === null) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const scale = d3.scaleLinear(originDomain.yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      let yDomain = t.rescaleY(scale).domain();
      acc[id] = yDomain;
      return acc;
      // return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
    }, {});
  } else {
    const scale = d3.scaleLinear(
      originDomain.yDomains[draft.activeSpectrum.id],
      [height - margin.bottom, margin.top],
    );
    let yDomain = t.rescaleY(scale).domain();
    draft.yDomains[draft.activeSpectrum.id] = yDomain;
  }
};

const handleZoom = (state, zoomFactor) => {
  return produce(state, (draft) => {
    setZoom(state, draft, zoomFactor);
  });
};

const zoomOut = (state, zoomType) => {
  return produce(state, (draft) => {
    switch (zoomType) {
      case 'H':
        draft.xDomain = state.originDomain.x;
        break;
      case 'V':
        setZoom(state, draft, { scale: 0.8 });
        break;
      default:
        draft.xDomain = state.originDomain.x;
        setZoom(state, draft, { scale: 0.8 });
        break;
    }
  });
};

const handleAddMolecule = (state, molfile) => {
  AnalysisObj.addMolfile(molfile);
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.getMolecules();
  });
};

const handleSetMolecule = (state, molfile, key) => {
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.setMolfile(molfile, key);
  });
};

const handleDeleteMolecule = (state, key) => {
  return produce(state, (draft) => {
    AnalysisObj.removeMolecule(key);
    draft.molecules = AnalysisObj.getMolecules();
  });
};

function getActiveData(draft) {
  if (draft.activeTab) {
    const groupByNucleus = GroupByInfoKey('nucleus');
    let data = groupByNucleus(draft.data)[draft.activeTab];
    // draft.activeSpectrum = null;
    if (draft.activeSpectrum) {
      const activeSpectrumIndex = data.findIndex(
        (datum) => datum.id === draft.activeSpectrum.id,
      );
      if (activeSpectrumIndex !== -1) {
        const isFid = data[activeSpectrumIndex].info.isFid || false;
        data = data.filter((datum) => datum.info.isFid === isFid);
      }
    } else {
      data = data ? data.filter((datum) => datum.info.isFid === false) : [];
    }

    for (let datum of draft.data) {
      if (data.some((activeData) => activeData.id === datum.id)) {
        AnalysisObj.getDatum(datum.id).isVisibleInDomain = true;
        datum.isVisibleInDomain = true;
      } else {
        AnalysisObj.getDatum(datum.id).isVisibleInDomain = false;
        datum.isVisibleInDomain = false;
      }
    }
    return draft.data;
  } else {
    return draft.data;
  }
}

function setMode(draft) {
  const data = getActiveData(draft).filter(
    (datum) => datum.isVisibleInDomain === true,
  );
  draft.mode = data && data[0] && data[0].info.isFid ? 'LTR' : 'RTL';
}

function setDomain(draft, isYDomainChanged = true) {
  let domain;
  const data = getActiveData(draft);

  if (draft.activeTab) {
    domain = getDomain(data);
    draft.xDomain = domain.x;
    if (isYDomainChanged) {
      draft.yDomain = domain.y;
      draft.yDomains = domain.yDomains;
      draft.originDomain = {
        x: domain.x,
        y: domain.y,
        yDomains: domain.yDomains,
      };
    } else {
      draft.originDomain = {
        ...draft.originDomain,
        x: domain.x,
      };
    }
    draft.integralsYDomains = domain.integralsYDomains;
    // draft.data = draft.data.map((d) => {
    //   return { ...d, integralsYDomain: domain.y };
    // });
  } else {
    domain = getDomain(data);
    // console.log(domain);
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
  }
}

const handleDeleteSpectra = (state, action) => {
  return produce(state, (draft) => {
    const { activeSpectrum } = draft;
    if (activeSpectrum && activeSpectrum.id) {
      AnalysisObj.deleteDatumByIDs([activeSpectrum.id]);
      draft.activeSpectrum = null;
      draft.data = AnalysisObj.getSpectraData();
      setDomain(draft);
      setMode(draft);
    } else {
      const { IDs } = action;
      AnalysisObj.deleteDatumByIDs(IDs);
      draft.data = AnalysisObj.getSpectraData();
    }
  });
};

const handleChangeSpectrumDisplayMode = (state, { flag }) => {
  return produce(state, (draft) => {
    const { activeSpectrum, data, height } = state;
    let YAxisShift = DEFAULT_YAXIS_SHIFT_VALUE;
    if (activeSpectrum) {
      const { index } = activeSpectrum;
      if (data[index].isFid) {
        YAxisShift = height / 2;
      }
    }

    draft.verticalAlign.flag = flag;
    draft.verticalAlign.stacked = flag;

    if (flag) {
      draft.verticalAlign.value = Math.floor(height / (state.data.length + 2));
    } else {
      draft.verticalAlign.value = YAxisShift;
    }
  });
};

const handleChangeIntegralYDomain = (state, newYDomain) => {
  return produce(state, (draft) => {
    const activeSpectrum = draft.activeSpectrum;
    if (activeSpectrum) {
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  });
};

const handleChangeIntegralSum = (state, value) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeIntegralSum(value);
      draft.data[index].integrals = datumObject.getIntegrals();
      if (!state.data.integralsYDomain) {
        draft.integralsYDomains[id] = draft.yDomains[id];
      }
    }
  });
};
const handleAutoPeakPicking = (state, autOptions) => {
  return produce(state, (draft) => {
    draft.selectedTool = options.zoom.id;
    draft.selectedOptionPanel = null;
    const activeSpectrumId = state.activeSpectrum.id;
    const ob = AnalysisObj.getDatum(activeSpectrumId);
    const peaks = ob.applyAutoPeakPicking(autOptions);
    const index = state.data.findIndex((d) => d.id === activeSpectrumId);
    if (index !== -1) {
      draft.data[index].peaks = peaks;
    }
  });
};
const handleAutoRangesDetection = (state, detectionOptions) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      draft.selectedTool = options.zoom.id;
      draft.selectedOptionPanel = null;
      const ob = AnalysisObj.getDatum(id);
      const ranges = ob.detectRanges(detectionOptions);
      draft.data[index].ranges = ranges;
    }
  });
};
const handleDeleteRange = (state, rangeID) => {
  return produce(state, (draft) => {
    const { id, index } = state.activeSpectrum;
    const ob = AnalysisObj.getDatum(id);
    ob.deleteRange(rangeID);
    draft.data[index].ranges = ob.getRanges();
  });
};

//////////////////////////////////////////////////////////////////////
//////////////// start undo and redo functions ///////////////////////
//////////////////////////////////////////////////////////////////////

const handleHistoryUndo = (state) => {
  const { past, present, future } = state.history;
  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  const newfuture = [present, ...future];

  const hasRedo = newfuture.length !== 0;
  const hasUndo = past.length !== 0;

  AnalysisObj.undoFilter(past);
  let resultData = AnalysisObj.getSpectraData();

  const domain = getDomain(resultData);
  const history = {
    past: newPast,
    present: previous,
    future: newfuture,
    hasRedo,
    hasUndo,
  };

  return {
    ...state,
    data: resultData,
    xDomain: domain.x,
    yDomain: domain.y,
    originDomain: domain,
    history,
  };
};

const handleHistoryRedo = (state) => {
  return produce(state, (draft) => {
    const { history } = draft;
    const next = history.future[0];
    const newPresent = history.future.shift();
    history.past.push(history.present);
    history.present = newPresent;
    history.hasUndo = true;
    history.hasRedo = history.future.length > 0;

    AnalysisObj.redoFilter(next);
    draft.data = AnalysisObj.getSpectraData();
    setDomain(draft);
  });
};

const handleHistoryReset = (state, action) => {
  return produce(state, (draft) => {
    draft.history = {
      past: [],
      present: action,
      future: [],
      hasRedo: false,
      hasUndo: false,
    };
  });
};

const handleBrushEnd = (state, action) => {
  const scale = getScale(state).x;
  return produce(state, (draft) => {
    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);
    if (start > end) {
      draft.xDomain = [end, start];
    } else {
      draft.xDomain = [start, end];
    }
  });
};
const setVerticalIndicatorXPosition = (state, position) => {
  return produce(state, (draft) => {
    const scaleX = getScale(state).x;
    draft.pivot = scaleX.invert(position);
  });
};

const handelResetDomain = (state) => {
  return produce(state, (draft) => {
    draft.xDomain = state.originDomain.x;
    draft.yDomain = state.originDomain.y;
  });
};

const handelSetPreferences = (state, action) => {
  const { type, values } = action;
  return produce(state, (draft) => {
    const preferences = AnalysisObj.getPreferences();
    const panelsPreferences =
      preferences && Object.prototype.hasOwnProperty.call(preferences, 'panels')
        ? preferences.panels
        : {};
    AnalysisObj.setPreferences({
      panels: { ...panelsPreferences, [type]: values },
    });
    draft.preferences = AnalysisObj.getPreferences();
  });
};

const handelSetActiveTab = (state, tab) => {
  return produce(state, (draft) => {
    const { data } = state;

    draft.activeTab = tab;
    const groupByNucleus = GroupByInfoKey('nucleus');
    const _data = groupByNucleus(data)[tab];

    if (_data && _data.length === 1) {
      const index = data.findIndex((datum) => datum.id === _data[0].id);
      draft.activeSpectrum = { id: _data[0].id, index };
    }

    setDomain(draft);
    setMode(draft);
  });
};

const handleAddBaseLineZone = (state, { from, to }) => {
  const scale = getScale(state).x;

  return produce(state, (draft) => {
    let start = scale.invert(from);
    const end = scale.invert(to);

    let zone = [];
    if (start > end) {
      zone = [end, start];
    } else {
      zone = [start, end];
    }

    const zones = state.baseLineZones.slice();
    zones.push({
      id: generateID(),
      from: zone[0],
      to: zone[1],
    });
    draft.baseLineZones = zones;
  });
};

const handleDeleteBaseLineZone = (state, id) => {
  return produce(state, (draft) => {
    draft.baseLineZones = state.baseLineZones.filter((zone) => zone.id !== id);
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
    setDataByFilters(draft, activeObject, activeSpectrumId);
    setDomain(draft);
    setMode(draft);
  });
};
const setKeyPreferencesHandler = (state, keyCode) => {
  return produce(state, (draft) => {
    const { activeTab, data, activeSpectrum, zoomFactor, xDomain } = state;
    if (activeTab) {
      const groupByNucleus = GroupByInfoKey('nucleus');
      const spectrumsGroupsList = groupByNucleus(data);
      draft.keysPreferences[keyCode] = {
        activeTab,
        activeSpectrum,
        zoomFactor,
        xDomain,
        data: spectrumsGroupsList[activeTab].reduce((acc, datum) => {
          acc[datum.id] = {
            color: datum.color,
            isVisible: datum.isVisible,
            isPeaksMarkersVisible: datum.isPeaksMarkersVisible,
          };
          return acc;
        }, {}),
      };
    }
  });
};
const applyKeyPreferencesHandler = (state, keyCode) => {
  return produce(state, (draft) => {
    const preferences = state.keysPreferences[keyCode];
    if (preferences) {
      draft.activeTab = preferences.activeTab;
      draft.data = state.data.map((datum) => {
        return {
          ...datum,
          ...(datum.info.nucleus === preferences.activeTab
            ? preferences.data[datum.id]
            : { isVisible: false }),
        };
      });
      draft.activeSpectrum = preferences.activeSpectrum;
      setDomain(draft);
      draft.xDomain = preferences.xDomain;
      setZoom(state, draft, preferences.zoomFactor);
    }
  });
};

//////////////////////////////////////////////////////////////////////
//////////////// end undo and redo functions /////////////////////////
//////////////////////////////////////////////////////////////////////

export const initialState = {
  data: null,
  tempData: null,
  xDomain: [],
  yDomain: [],
  yDomains: {},
  originDomain: {},
  integralsYDomains: {},
  selectedTool: options.zoom.id,
  selectedFilter: null,
  selectedOptionPanel: null,
  activeTab: null,

  // peakNotations: [],
  width: null,
  height: null,
  margin: {
    top: 10,
    right: 20,
    bottom: 30,
    left: 0,
  },
  activeSpectrum: null,
  mode: 'RTL',
  zoomFactor: { scale: 1 },
  integralZoomFactor: { scale: 4 },
  molecules: [],
  verticalAlign: {
    flag: false,
    stacked: false,
    value: DEFAULT_YAXIS_SHIFT_VALUE,
  },
  history: {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  },
  pivot: 0,
  isLoading: false,
  preferences: {},
  baseLineZones: [],
  keysPreferences: {},
};

export const spectrumReducer = (state, action) => {
  switch (action.type) {
    case INITIATE:
      return initiate(state, action.data);
    case SET_LOADING_FLAG:
      return setIsLoading(state, action.isLoading);
    case LOAD_JSON_FILE:
      return handleLoadJsonFile(state, action.data);
    case LOAD_JCAMP_FILE:
      return loadJcampFile(state, action.files);
    case LOAD_MOL_FILE:
      return handleLoadMOLFile(state, action.files);
    case LOAD_ZIP_FILE:
      return handleLoadZIPFile(state, action.files);

    case EXPORT_DATA:
      return exportData(state, action);
    case ADD_PEAK:
      return addPeak(state, action.mouseCoordinates);
    case ADD_PEAKS:
      return addPeaks(state, action);

    case DELETE_PEAK_NOTATION:
      return deletePeak(state, action.data);

    case ADD_INTEGRAL:
      return addIntegral(state, action);
    case DELETE_INTEGRAL:
      return deleteIntegral(state, action);
    case CHANGE_INTEGRAL_DATA:
      return changeIntegral(state, action);

    case RESIZE_INTEGRAL:
      return handleResizeIntegral(state, action.integral);

    case SET_ORIGINAL_DOMAIN:
      return setOriginalDomain(state, action.domain);

    case SET_X_DOMAIN:
      return setXDomain(state, action.xDomain);

    case SET_WIDTH:
      return setWidth(state, action.width);

    case SET_DIMENSIONS:
      return handleSetDimensions(state, action.width, action.height);

    case SET_POINTER_COORDINATES:
      return setPointerCoordinates(state, action.pointerCoordinates);

    case SET_SELECTED_TOOL:
      return setSelectedTool(state, action.selectedTool);
    case RESET_SELECTED_TOOL:
      return resetSelectedTool(state);

    case SET_SELECTED_OPTIONS_PANEL:
      return setSelectedOptionPanel(state, action.selectedOptionPanel);

    case SET_DATA:
      return setData(state, action.data);

    case FULL_ZOOM_OUT:
      return zoomOut(state, action.zoomType);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);
    case APPLY_ZERO_FILLING_FILTER:
      return applyZeroFillingFilter(state, action.value);
    case APPLY_FFT_FILTER:
      return applyFFTFilter(state);
    case APPLY_MANUAL_PHASE_CORRECTION_FILTER:
      return applyManualPhaseCorrectionFilter(state, action.value);
    case CALCULATE_MANUAL_PHASE_CORRECTION_FILTER:
      return calculateManualPhaseCorrection(state, action.value);
    case ENABLE_FILTER:
      return enableFilter(state, action.id, action.checked);

    case DELETE_FILTER:
      return deleteFilter(state, action.id);

    case CHANGE_VISIBILITY:
      return handleSpectrumVisibility(state, action.data);

    case CHANGE_PEAKS_MARKERS_VISIBILITY:
      return handleChangePeaksMarkersVisibility(state, action.data);
    case CHANGE_ACTIVE_SPECTRUM:
      return handleChangeActiveSpectrum(state, action.data);

    case CHANGE_SPECTRUM_COLOR:
      return handleChangeSpectrumColor(state, action.data);
    case TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return handleToggleRealImaginaryVisibility(state);
    case SET_ZOOM_FACTOR:
      return handleZoom(state, action.zoomFactor);
    // return {
    //   ...state,
    //   zoomFactor: action.zoomFactor,
    // };

    case CHANGE_SPECTRUM_DISPLAY_VIEW_MODE:
      return handleChangeSpectrumDisplayMode(state, action);

    case ADD_MOLECULE:
      return handleAddMolecule(state, action.molfile);

    case SET_MOLECULE:
      return handleSetMolecule(state, action.molfile, action.key);

    case DELETE_MOLECULE:
      return handleDeleteMolecule(state, action.key);

    case DELETE_SPECTRA:
      return handleDeleteSpectra(state, action);

    case SET_INTEGRAL_Y_DOMAIN:
      return handleChangeIntegralYDomain(state, action.yDomain);

    case CHANGE_INTEGRAL_ZOOM:
      return handleChangeIntegralZoom(state, action.zoomFactor);

    case CHANGE_INTEGRAL_SUM:
      return handleChangeIntegralSum(state, action.value);

    case BRUSH_END:
      return handleBrushEnd(state, action);

    case SET_VERTICAL_INDICATOR_X_POSITION:
      return setVerticalIndicatorXPosition(state, action.position);
    case SET_SPECTRUMS_VERTICAL_ALIGN:
      return setSpectrumsVerticalAlign(state, action.flag);

    case AUTO_PEAK_PICKING:
      return handleAutoPeakPicking(state, action.options);

    case AUTO_RANGES_DETECTION:
      return handleAutoRangesDetection(state, action.options);
    case DELETE_RANGE:
      return handleDeleteRange(state, action.rangeID);
    case SET_PREFERENCES:
      return handelSetPreferences(state, action.data);
    case SET_ACTIVE_TAB:
      return handelSetActiveTab(state, action.tab);
    case ADD_BASE_LINE_ZONE:
      return handleAddBaseLineZone(state, action.zone);
    case DELETE_BASE_LINE_ZONE:
      return handleDeleteBaseLineZone(state, action.id);
    case APPLY_BASE_LINE_CORRECTION_FILTER:
      return handleBaseLineCorrectionFilter(state, action);
    case SET_KEY_PREFERENCES:
      return setKeyPreferencesHandler(state, action.keyCode);
    case APPLY_KEY_PREFERENCES:
      return applyKeyPreferencesHandler(state, action.keyCode);

    case RESET_DOMAIN:
      return handelResetDomain(state);
    case UNDO:
      return handleHistoryUndo(state);

    case REDO:
      return handleHistoryRedo(state);

    case RESET:
      return handleHistoryReset(state, action);

    default:
      return state;
  }
};
