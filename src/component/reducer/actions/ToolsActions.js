import { max } from 'd3';
import { produce } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { Datum2D } from '../../../data/data2d/Datum2D';
import generateID from '../../../data/utilities/generateID';
import { getYScale, getXScale } from '../../1d/utilities/scale';
import { LAYOUT } from '../../2d/utilities/DimensionLayout';
import { get2DYScale, get2DXScale } from '../../2d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import {
  DEFAULT_YAXIS_SHIFT_VALUE,
  DISPLAYER_MODE,
  MARGIN,
} from '../core/Constants';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setDomain, getDomain, setMode } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { setZoom1D, setZoom, spectrumZoomHanlder, ZoomType } from './Zoom';

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
  const scaleX = getXScale(null, state);

  return produce(state, (draft) => {
    let start = scaleX.invert(from);
    const end = scaleX.invert(to);

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

      draft.data[index].display.isRealSpectrumVisible = !draft.data[index]
        .display.isRealSpectrumVisible;
      ob.setIsRealSpectrumVisible();
      // isRealSpectrumVisible
      if (draft.data[index].display.isRealSpectrumVisible) {
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
    const is2D = draft.displayerMode === DISPLAYER_MODE.DM_2D;
    const xScale = getXScale(null, state);

    const yScale = is2D ? get2DYScale(state) : getYScale(null, state);

    const startX = xScale.invert(action.startX);
    const endX = xScale.invert(action.endX);
    const startY = yScale.invert(action.startY);
    const endY = yScale.invert(action.endY);
    const domainX = startX > endX ? [endX, startX] : [startX, endX];
    const domainY = startY > endY ? [endY, startY] : [startY, endY];
    if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
      switch (action.trackID) {
        case LAYOUT.CENTER_2D:
          draft.xDomain = domainX;
          draft.yDomain = domainY;
          break;
        case LAYOUT.TOP_1D:
          draft.xDomain = domainX;
          break;
        case LAYOUT.LEFT_1D:
          draft.yDomain = domainY;
          break;
        default:
          break;
      }
    } else {
      const brushHistory = HorizontalZoomHistory.getInstance();
      brushHistory.push(state.xDomain);
      draft.xDomain = domainX;
    }
  });
};
const setVerticalIndicatorXPosition = (state, position) => {
  return produce(state, (draft) => {
    const scaleX = getXScale(null, state);
    draft.pivot = scaleX.invert(position);
  });
};

const handleZoom = (state, action) => {
  return produce(state, (draft) => {
    const { deltaY, deltaMode, trackID } = action;
    spectrumZoomHanlder.wheel(deltaY, deltaMode);
    if (trackID) {
      switch (trackID) {
        case LAYOUT.TOP_1D:
          setZoom1D(
            draft,
            spectrumZoomHanlder.getScale(),
            state.margin.top,
            10,
            0,
          );
          break;
        case LAYOUT.LEFT_1D:
          setZoom1D(
            draft,
            spectrumZoomHanlder.getScale(),
            state.margin.left,
            10,
            1,
          );
          break;
        default:
          return state;
      }
    } else {
      setZoom(state, draft, spectrumZoomHanlder.getScale());
    }
  });
};

const zoomOut = (state, action) => {
  const { zoomType, trackID } = action;
  return produce(state, (draft) => {
    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      const zoomHistory = HorizontalZoomHistory.getInstance();
      switch (zoomType) {
        case ZoomType.HORIZONTAL: {
          draft.xDomain = state.originDomain.xDomain;
          break;
        }
        case ZoomType.VERTICAL:
          spectrumZoomHanlder.setScale(0.8);
          setZoom(state, draft, 0.8);
          break;
        case ZoomType.STEP_HROZENTAL: {
          spectrumZoomHanlder.setScale(0.8);
          const zoomValue = zoomHistory.pop();
          draft.xDomain = zoomValue ? zoomValue : state.originDomain.xDomain;
          setZoom(state, draft, 0.8);
          break;
        }
        default: {
          spectrumZoomHanlder.setScale(0.8);
          draft.xDomain = state.originDomain.xDomain;
          setZoom(state, draft, 0.8);
          break;
        }
      }
    } else {
      const { xDomain, yDomain, yDomains } = state.originDomain;
      switch (trackID) {
        case LAYOUT.TOP_1D: {
          const { id } = draft.tabActiveSpectrum[draft.activeTab.split(',')[0]];
          draft.xDomain = xDomain;
          draft.yDomains[id] = yDomains[id];
          break;
        }
        case LAYOUT.LEFT_1D: {
          const { id } = draft.tabActiveSpectrum[draft.activeTab.split(',')[1]];
          draft.yDomain = yDomain;
          draft.yDomains[id] = yDomains[id];

          break;
        }
        case LAYOUT.CENTER_2D:
          draft.xDomain = xDomain;
          draft.yDomain = yDomain;
          break;
        default:
          draft.xDomain = xDomain;
          draft.yDomain = yDomain;
          draft.yDomains = yDomains;
          break;
      }
      // draft.yDomain = yDomain;
      // draft.xDomains = xDomains;
      // draft.yDomains = yDomains;
    }
  });
};

function hasAcceptedSpectrum(draft, index) {
  const nucleuses = draft.activeTab.split(',');
  return (
    draft.tabActiveSpectrum[nucleuses[index]] &&
    !draft.data[draft.tabActiveSpectrum[nucleuses[index]].index].info.isFid
  );
}

const setMargin = (draft) => {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    const top = hasAcceptedSpectrum(draft, 0)
      ? MARGIN['2D'].top
      : MARGIN['1D'].top;
    const left = hasAcceptedSpectrum(draft, 1)
      ? MARGIN['2D'].left
      : MARGIN['1D'].left;
    draft.margin = { ...MARGIN['2D'], top, left };
  } else {
    draft.margin = MARGIN['1D'];
  }
};

function Processing2DData(draft, data) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    let _data = {};
    for (const datum of data[draft.activeTab]) {
      const data2dObject = AnalysisObj.getDatum(datum.id);
      _data[datum.id] = data2dObject.getContourLines();
    }
    draft.contours = _data;
  }
}

const setDisplayerMode = (draft, data) => {
  draft.displayerMode = data.some((d) => d.info.dimension === 2)
    ? DISPLAYER_MODE.DM_2D
    : DISPLAYER_MODE.DM_1D;
};

const setActiveTab = (draft, dataGroupByTab, tab) => {
  const groupByTab = Object.keys(dataGroupByTab).sort((a, b) =>
    a.split(',').length > b.split(',').length ? -1 : 1,
  );

  if (
    JSON.stringify(groupByTab) !==
    JSON.stringify(Object.keys(draft.tabActiveSpectrum))
  ) {
    let tabs2D = [];

    const tabkeys = Object.keys(dataGroupByTab).sort((a, b) =>
      a.split(',').length > b.split(',').length ? -1 : 1,
    );
    for (let tabKey of tabkeys) {
      const data = dataGroupByTab[tabKey];

      if (tabKey.split(',').length === 2) {
        tabs2D.push(tabKey);
      }

      if (data.length === 1) {
        const index = draft.data.findIndex((datum) => datum.id === data[0].id);
        draft.tabActiveSpectrum[tabKey] = { id: data[0].id, index };
      } else {
        if (dataGroupByTab[tab].length === 2) {
          const FTSpectrums = dataGroupByTab[tab].filter((d) => !d.info.isFid);
          if (FTSpectrums && FTSpectrums.length > 0) {
            const index = draft.data.findIndex(
              (datum) => datum.id === FTSpectrums[0].id,
            );
            draft.tabActiveSpectrum[tabKey] = { id: FTSpectrums[0].id, index };
          } else {
            draft.tabActiveSpectrum[tabKey] = null;
          }
        } else {
          draft.tabActiveSpectrum[tabKey] = null;
        }
      }
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

      Processing2DData(draft, dataGroupByNucleus);
      setDomain(draft);
      setMode(draft);
    }
  });
};

const levelChangeHandler = (state, { deltaY, shiftKey }) => {
  try {
    if (state.activeSpectrum) {
      const { id } = state.activeSpectrum;
      const datum2dObject = AnalysisObj.getDatum(id);
      if (datum2dObject instanceof Datum2D) {
        const processing2dController = datum2dObject.getProcessingController();
        if (shiftKey) {
          processing2dController.shiftWheel(deltaY);
        } else {
          processing2dController.wheel(deltaY);
        }

        return produce(state, (draft) => {
          const contours = processing2dController.drawContours();
          draft.contours[id] = contours;
        });
      }
      return state;
    } else {
      return state;
    }
  } catch (e) {
    return state;
  }
};

const projection2dHandler = (state, position) => {
  // eslint-disable-next-line no-unused-vars
  return produce(state, (draft) => {
    const scaleX = get2DXScale(state);
    const scaleY = get2DYScale(state);

    if (state.activeSpectrum.id) {
      const x = scaleX.invert(position.x);
      const y = scaleY.invert(position.y);

      const projection = AnalysisObj.createProjection(
        state.activeSpectrum.id,
        x,
        y,
      );
      // eslint-disable-next-line no-console
      console.log(projection);
      // draft.projection = projection;
    }
  });
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
  handleZoom,
  zoomOut,
  handelSetActiveTab,
  levelChangeHandler,
  projection2dHandler,
};
