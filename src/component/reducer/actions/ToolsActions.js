import { max, zoomIdentity, scaleLinear } from 'd3';
import { produce } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import generateID from '../../../data/utilities/generateID';
import { options } from '../../toolbar/ToolTypes';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import {
  DEFAULT_YAXIS_SHIFT_VALUE,
  DISPLAYER_MODE,
  MARGIN,
} from '../core/Constants';
import Spectrum2D from '../core/Spectrum2D';
import { getYScale, getXScale } from '../core/scale';
import getClosestNumber from '../helper/GetClosestNumber';
import Spectrum1DZoomHelper from '../helper/Spectrum1DZoomHelper';

import { setDomain, getDomain, setMode } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { getScale } from './ScaleActions';

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

function setFilterChanges(draft, state, selectedFilter) {
  const activeSpectrumId = state.activeSpectrum.id;
  const activeObject = AnalysisObj.getDatum(activeSpectrumId);

  //save reduced snapshot
  // console.log(dd);
  //select the equalizer tool when you enable manual phase correction filter
  if (selectedFilter === Filters.phaseCorrection.id) {
    draft.tempData = state.data;

    // AnalysisObj.createDataSnapshot();
    // draft.data = AnalysisObj.getSpectraData(true);
    const { xValue } = getStrongestPeak(state);
    draft.pivot = xValue;
  } else {
    if (draft.selectedTool === options.phaseCorrection.id) {
      const spectrumIndex = draft.data.findIndex(
        (spectrum) => spectrum.id === activeSpectrumId,
      );

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

function setYAxisShift(data, draft, height) {
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

const resetSelectedTool = (state) => {
  return produce(state, (draft) => {
    draft.selectedOptionPanel = null;
    draft.selectedTool = options.zoom.id;
    draft.baseLineZones = [];
    if (state.tempData) {
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

const setSpectrumsVerticalAlign = (state, flag) => {
  return produce(state, (draft) => {
    changeSpectrumDisplayPreferences(state, draft, { center: flag });
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
          draft.xDomain = domain.xDomain;
          draft.yDomain = domain.yDomain;
          draft.xDomains = domain.xDomains;
          draft.yDomains = domain.yDomains;
        }
      } else {
        if (imY !== null && imY !== undefined) {
          draft.data[index].y = imY;
          const domain = getDomain(draft.data);
          draft.xDomain = domain.xDomain;
          draft.yDomain = domain.yDomain;
          draft.xDomains = domain.xDomains;
          draft.yDomains = domain.yDomains;
        }
      }
    }
  });
};

const handleBrushEnd = (state, action) => {
  // const scale = getScale(state).x;
  return produce(state, (draft) => {
    const isReverse = draft.displayerMode === DISPLAYER_MODE.DM_2D;
    const xScale = getXScale(null, state);
    const yScale = getYScale(null, null, isReverse, state);

    const startX = xScale.invert(action.startX);
    const endX = xScale.invert(action.endX);
    const startY = yScale.invert(action.startY);
    const endY = yScale.invert(action.endY);
    const domainX = startX > endX ? [endX, startX] : [startX, endX];
    const domainY = startY > endY ? [endY, startY] : [startY, endY];

    draft.xDomain = domainX;
    draft.yDomain = domainY;
  });
};
const setVerticalIndicatorXPosition = (state, position) => {
  return produce(state, (draft) => {
    const scaleX = getScale(state).x;
    draft.pivot = scaleX.invert(position);
  });
};

const setZoom = (state, draft, scale) => {
  const { originDomain, height, margin, data } = state;
  let t;
  if (data.length === 1) {
    const closest = getClosestNumber(data[0].y);
    const referencePoint = getScale(state).y(closest);
    t = zoomIdentity
      .translate(0, referencePoint)
      .scale(scale)
      .translate(0, -referencePoint);
  } else {
    t = zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(scale)
      .translate(0, -(height - margin.bottom));
  }

  draft.zoomFactor = { scale };

  if (draft.activeSpectrum === null) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const _scale = scaleLinear(originDomain.yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      let yDomain = t.rescaleY(_scale).domain();
      acc[id] = yDomain;
      return acc;
      // return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
    }, {});
  } else {
    const _scale = scaleLinear(originDomain.yDomains[draft.activeSpectrum.id], [
      height - margin.bottom,
      margin.top,
    ]);
    let yDomain = t.rescaleY(_scale).domain();
    draft.yDomains[draft.activeSpectrum.id] = yDomain;
  }
};

const spectrumZoomHanlder = new Spectrum1DZoomHelper();

const handleZoom = (state, action) => {
  return produce(state, (draft) => {
    const { deltaY, deltaMode } = action;
    spectrumZoomHanlder.wheel(deltaY, deltaMode);
    setZoom(state, draft, spectrumZoomHanlder.getScale());
  });
};

const zoomOut = (state, zoomType) => {
  return produce(state, (draft) => {
    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      switch (zoomType) {
        case 'H':
          draft.xDomain = state.originDomain.xDomain;
          break;
        case 'V':
          setZoom(state, draft, 0.8);
          break;
        default:
          draft.xDomain = state.originDomain.xDomain;
          setZoom(state, draft, 0.8);
          break;
      }
    } else {
      const { xDomain, yDomain, xDomains, yDomains } = state.originDomain;
      draft.xDomain = xDomain;
      draft.yDomain = yDomain;
      draft.xDomains = xDomains;
      draft.yDomains = yDomains;
    }
  });
};

const setMargin = (draft) => {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    const nucleuses = draft.activeTab.split(',');
    const top = draft.tabActiveSpectrum[nucleuses[0]]
      ? MARGIN['2D'].top
      : MARGIN['1D'].top;
    const left = draft.tabActiveSpectrum[nucleuses[1]]
      ? MARGIN['2D'].left
      : MARGIN['1D'].left;
    draft.margin = { ...MARGIN['2D'], top, left };
  } else {
    draft.margin = MARGIN['1D'];
  }
};

function initiate2D(draft, data) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    if (draft.tabActiveSpectrum[draft.activeTab]) {
      const data2D = data[draft.tabActiveSpectrum[draft.activeTab].index];
      const spectrum2D = new Spectrum2D(data2D);
      draft.contours = spectrum2D.drawContours();
    }
  }
}

const setDisplayerMode = (draft, data) => {
  draft.displayerMode = data.some((d) => d.info.dimension === 2)
    ? DISPLAYER_MODE.DM_2D
    : DISPLAYER_MODE.DM_1D;
};

const setActiveTab = (draft, dataGroupByTab, tab) => {
  if (
    JSON.stringify(Object.keys(dataGroupByTab)) !==
    JSON.stringify(Object.keys(draft.tabActiveSpectrum))
  ) {
    let tabs2D = [];
    for (let tabKey of Object.keys(dataGroupByTab)) {
      if (tabKey.split(',').length === 2) {
        tabs2D.push(tabKey);
      }
      const data = dataGroupByTab[tabKey];
      const index = draft.data.findIndex((datum) => datum.id === data[0].id);
      draft.tabActiveSpectrum[tabKey] = { id: data[0].id, index };
    }

    if (tabs2D.length > 0) {
      draft.activeSpectrum = draft.tabActiveSpectrum[tabs2D[0]];
      draft.activeTab = tabs2D[0];
    } else {
      draft.activeSpectrum = draft.tabActiveSpectrum[tab];
      draft.activeTab = tab;
    }
  } else {
    draft.activeTab = tab;
    draft.activeSpectrum = draft.tabActiveSpectrum[tab];
  }

  setDisplayerMode(draft, dataGroupByTab[draft.activeTab]);
  setMargin(draft);
};

const handelSetActiveTab = (state, tab) => {
  return produce(state, (draft) => {
    const { data } = state;
    if (tab) {
      const groupByNucleus = GroupByInfoKey('nucleus');
      const dataGroupByNucleus = groupByNucleus(data);
      setActiveTab(draft, dataGroupByNucleus, tab);

      initiate2D(draft, data);
      setDomain(draft);
      setMode(draft);
    }
  });
};

const levelChangeHandler = (state, { deltaY, shiftKey }) => {
  try {
    const spectrum2D = Spectrum2D.getInstance();
    if (shiftKey) {
      spectrum2D.shiftWheel(deltaY);
    } else {
      spectrum2D.wheel(deltaY);
    }

    const contours = spectrum2D.drawContours();
    return { ...state, contours };
  } catch (e) {
    return state;
  }
};

export {
  resetSelectedTool,
  setSelectedTool,
  setSelectedOptionPanel,
  setYAxisShift,
  setSpectrumsVerticalAlign,
  handleChangeSpectrumDisplayMode,
  handleAddBaseLineZone,
  handleDeleteBaseLineZone,
  handleToggleRealImaginaryVisibility,
  handleBrushEnd,
  setVerticalIndicatorXPosition,
  setZoom,
  handleZoom,
  zoomOut,
  handelSetActiveTab,
  levelChangeHandler,
};
