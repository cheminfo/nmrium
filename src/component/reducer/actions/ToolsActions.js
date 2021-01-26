import { max } from 'd3';
import { original, current } from 'immer';

import { Filters } from '../../../data/data1d/filter1d/Filters';
import { Datum2D } from '../../../data/data2d/Datum2D';
import generateID from '../../../data/utilities/generateID';
import { getYScale, getXScale } from '../../1d/utilities/scale';
import { LAYOUT } from '../../2d/utilities/DimensionLayout';
import { get2DYScale } from '../../2d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import {
  DEFAULT_YAXIS_SHIFT_VALUE,
  DISPLAYER_MODE,
  MARGIN,
} from '../core/Constants';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setDomain, getDomain, setMode } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { setZoom1D, setZoom, ZoomType, wheel } from './Zoom';

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
  const activeObject = draft.AnalysisObj.getDatum(activeSpectrumId);

  //save reduced snapshot
  //select the equalizer tool when you enable manual phase correction filter
  if (selectedFilter === Filters.phaseCorrection.id) {
    draft.tempData = state.data;

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

function resetTool(draft, setDefaultTool = true) {
  draft.selectedOptionPanel = null;
  if (setDefaultTool) {
    draft.selectedTool = options.zoom.id;
  }
  draft.baseLineZones = [];
  if (draft.tempData) {
    draft.tempData = null;
    setDomain(draft);
  }
}

function resetSelectedTool(draft, filterOnly = false) {
  if (!filterOnly) {
    resetTool(draft);
  } else {
    if (draft.selectedTool && options[draft.selectedTool].isFilter) {
      resetTool(draft);
    }
  }
}

function setSelectedTool(draft, selectedTool) {
  const state = original(draft);
  if (selectedTool) {
    if (selectedTool !== draft.selectedTool) {
      resetTool(draft, false);
    }
    draft.selectedTool = selectedTool;
    if (options[selectedTool].hasOptionPanel) {
      draft.selectedOptionPanel = selectedTool;
    }

    if (options[selectedTool].isFilter) {
      setFilterChanges(draft, state, selectedTool);
    }
  } else {
    resetTool(draft, false);
  }
  setMargin(draft);
}

function setSelectedOptionPanel(draft, selectedOptionPanel) {
  draft.selectedOptionPanel = selectedOptionPanel;
}

function setSpectrumsVerticalAlign(draft, flag) {
  changeSpectrumDisplayPreferences(draft, { center: flag });
}

function handleChangeSpectrumDisplayMode(draft, { flag }) {
  const state = original(draft);
  const { activeSpectrum, height, activeTab } = draft;
  let YAxisShift = DEFAULT_YAXIS_SHIFT_VALUE;
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    if (state.data[index].isFid) {
      YAxisShift = height / 2;
    }
  }
  draft.verticalAlign.flag = flag;
  draft.verticalAlign.stacked = flag;

  if (flag) {
    const count = state.data.filter((datum) => datum.info.nucleus === activeTab)
      .length;
    draft.verticalAlign.value = Math.floor(height / (count + 2));
  } else {
    draft.verticalAlign.value = YAxisShift;
  }
}

function handleAddBaseLineZone(draft, { from, to }) {
  const scaleX = getXScale(draft);

  let start = scaleX.invert(from);
  const end = scaleX.invert(to);

  let zone = [];
  if (start > end) {
    zone = [end, start];
  } else {
    zone = [start, end];
  }

  const zones = draft.baseLineZones.slice();
  zones.push({
    id: generateID(),
    from: zone[0],
    to: zone[1],
  });
  draft.baseLineZones = zones;
}

function handleDeleteBaseLineZone(draft, id) {
  const state = original(draft);
  draft.baseLineZones = state.baseLineZones.filter((zone) => zone.id !== id);
}

function handleToggleRealImaginaryVisibility(draft) {
  const state = original(draft);
  if (draft.activeSpectrum != null) {
    const activeSpectrumId = draft.activeSpectrum.id;
    const ob = draft.AnalysisObj.getDatum(activeSpectrumId);

    if (ob) {
      const reY = ob.getReal().y;
      const imY = ob.getImaginary().y;
      const index = state.data.findIndex((d) => d.id === activeSpectrumId);
      ob.setIsRealSpectrumVisible(!draft.data[index]);

      draft.data[index].display.isRealSpectrumVisible = !draft.data[index]
        .display.isRealSpectrumVisible;
      ob.setIsRealSpectrumVisible();
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
  }
}

function handleBrushEnd(draft, action) {
  const is2D = draft.displayerMode === DISPLAYER_MODE.DM_2D;
  const xScale = getXScale(draft);

  const yScale = is2D ? get2DYScale(draft) : getYScale(draft);

  const startX = xScale.invert(action.startX);
  const endX = xScale.invert(action.endX);
  const startY = yScale.invert(action.startY);
  const endY = yScale.invert(action.endY);
  const domainX = startX > endX ? [endX, startX] : [startX, endX];
  const domainY = startY > endY ? [endY, startY] : [startY, endY];
  const brushHistory = HorizontalZoomHistory.getInstance(draft.activeTab);

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
    if (brushHistory) {
      brushHistory.push({ xDomain: domainX, yDomain: domainY });
    }
  } else {
    draft.xDomain = domainX;
    if (brushHistory) {
      brushHistory.push({ xDomain: domainX, yDomain: draft.yDomain });
    }
  }
}
function setVerticalIndicatorXPosition(draft, position) {
  const scaleX = getXScale(draft);
  draft.pivot = scaleX.invert(position);
}

function getSpectrumID(draft, index) {
  return draft.tabActiveSpectrum[draft.activeTab.split(',')[index]].id;
}

function handleZoom(draft, action) {
  const state = original(draft);
  const { deltaY, deltaMode, trackID } = action;
  if (trackID) {
    switch (trackID) {
      case LAYOUT.TOP_1D: {
        const id = getSpectrumID(draft, 0);
        wheel(deltaY, deltaMode, state, id);
        setZoom1D(draft, state.margin.top, 10, 0);
        break;
      }
      case LAYOUT.LEFT_1D: {
        const id = getSpectrumID(draft, 1);
        wheel(deltaY, deltaMode, state, id);
        setZoom1D(draft, state.margin.left, 10, 1);
        break;
      }
      default:
        break;
    }
  } else {
    wheel(deltaY, deltaMode, state);
    setZoom(state, draft);
  }
}

function zoomOut(draft, action) {
  const { zoomType, trackID } = action;
  const state = original(draft);
  const zoomHistory = HorizontalZoomHistory.getInstance(draft.activeTab);

  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    switch (zoomType) {
      case ZoomType.HORIZONTAL: {
        draft.xDomain = draft.originDomain.xDomain;
        break;
      }
      case ZoomType.VERTICAL:
        setZoom(state, draft, 0.8);
        break;
      case ZoomType.STEP_HROZENTAL: {
        const zoomValue = zoomHistory.pop();
        draft.xDomain = zoomValue
          ? zoomValue.xDomain
          : draft.originDomain.xDomain;
        setZoom(state, draft, 0.8);
        break;
      }
      default: {
        draft.xDomain = draft.originDomain.xDomain;
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
      case LAYOUT.CENTER_2D: {
        const zoomValue = zoomHistory.pop();
        draft.xDomain = zoomValue ? zoomValue.xDomain : xDomain;
        draft.yDomain = zoomValue ? zoomValue.yDomain : yDomain;
        break;
      }
      default:
        draft.xDomain = xDomain;
        draft.yDomain = yDomain;
        draft.yDomains = yDomains;
        break;
    }
  }
}

function hasAcceptedSpectrum(draft, index) {
  const nucleuses = draft.activeTab.split(',');
  return (
    draft.tabActiveSpectrum[nucleuses[index]] &&
    !draft.data[draft.tabActiveSpectrum[nucleuses[index]].index].info.isFid
  );
}

function setMargin(draft) {
  if (
    draft.displayerMode === DISPLAYER_MODE.DM_2D &&
    draft.selectedTool !== options.slicingTool.id
  ) {
    const top = hasAcceptedSpectrum(draft, 0)
      ? MARGIN['2D'].top
      : MARGIN['1D'].top;
    const left = hasAcceptedSpectrum(draft, 1)
      ? MARGIN['2D'].left
      : MARGIN['1D'].left;
    draft.margin = { ...MARGIN['2D'], top, left };
  } else if (draft.selectedTool === options.slicingTool.id) {
    draft.margin = MARGIN['2D'];
  } else if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.margin = MARGIN['1D'];
  }
}

function Processing2DData(draft, data) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    let _data = {};
    for (const datum of data[draft.activeTab]) {
      const data2dObject = draft.AnalysisObj.getDatum(datum.id);
      _data[datum.id] = data2dObject.getContourLines();
    }
    draft.contours = _data;
  }
}

function setDisplayerMode(draft, data) {
  draft.displayerMode =
    data && data.some((d) => d.info.dimension === 2)
      ? DISPLAYER_MODE.DM_2D
      : DISPLAYER_MODE.DM_1D;
}

function setTabActiveSpectrum(draft, dataGroupByTab) {
  let tabs2D = [];
  const tabActiveSpectrum = {};

  const tabkeys = Object.keys(dataGroupByTab).sort((a, b) =>
    a.split(',').length > b.split(',').length ? -1 : 1,
  );
  for (let tabKey of tabkeys) {
    const data = dataGroupByTab[tabKey];
    const nucleusLength = tabKey.split(',').length;
    if (nucleusLength === 2) {
      tabs2D.push(tabKey);
    }

    if (data.length === 1) {
      const index = draft.data.findIndex((datum) => datum.id === data[0].id);
      tabActiveSpectrum[tabKey] = { id: data[0].id, index };
    } else {
      const tabSpectra = dataGroupByTab[tabKey];
      const tabSpectraLength = tabSpectra.length;
      if (tabSpectraLength >= 2) {
        const FTSpectrums = tabSpectra.filter((d) => !d.info.isFid);
        if (
          FTSpectrums.length > 0 &&
          (nucleusLength === 2 ||
            (nucleusLength === 1 && tabSpectraLength !== FTSpectrums.length))
        ) {
          const index = draft.data.findIndex(
            (datum) => datum.id === FTSpectrums[0].id,
          );
          tabActiveSpectrum[tabKey] = { id: FTSpectrums[0].id, index };
        } else {
          tabActiveSpectrum[tabKey] = null;
        }
      } else {
        tabActiveSpectrum[tabKey] = null;
      }
    }
  }
  draft.tabActiveSpectrum = tabActiveSpectrum;
  return tabs2D;
}

function setTab(draft, dataGroupByTab, tab, refresh = false) {
  const groupByTab = Object.keys(dataGroupByTab).sort((a, b) =>
    a.split(',').length > b.split(',').length ? -1 : 1,
  );

  if (
    JSON.stringify(groupByTab) !==
      JSON.stringify(Object.keys(draft.tabActiveSpectrum)) ||
    refresh
  ) {
    const tabs2D = setTabActiveSpectrum(draft, dataGroupByTab);

    if (tabs2D.length > 0 && tab == null) {
      draft.activeSpectrum = draft.tabActiveSpectrum[tabs2D[0]];
      draft.activeTab = tabs2D[0];
    } else {
      draft.activeSpectrum = tab ? draft.tabActiveSpectrum[tab] : tab;
      draft.activeTab = tab;
    }
  } else {
    draft.activeTab = tab;
    draft.activeSpectrum = draft.tabActiveSpectrum[tab];
  }

  setDisplayerMode(draft, dataGroupByTab[draft.activeTab]);
  setMargin(draft);
}

function setActiveTab(draft, tab = null, refreshTabActiveSpectrums = false) {
  const groupByNucleus = GroupByInfoKey('nucleus');
  const dataGroupByNucleus = groupByNucleus(current(draft).data);
  const tabs = Object.keys(dataGroupByNucleus);
  const currentTab = !tab || !tabs.includes(tab) ? tabs[0] : tab;
  setTab(draft, dataGroupByNucleus, currentTab, refreshTabActiveSpectrums);
  resetTool(draft);
  // resetFilterTool(draft);

  Processing2DData(draft, dataGroupByNucleus);
  setDomain(draft);

  const zoomHistory = HorizontalZoomHistory.getInstance(draft.activeTab);
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
  setMode(draft);
}

function handelSetActiveTab(draft, tab) {
  if (tab) {
    setActiveTab(draft, tab);
  }
}

function levelChangeHandler(draft, { deltaY, shiftKey }) {
  try {
    if (draft.activeSpectrum) {
      const { id } = draft.activeSpectrum;
      const datum2dObject = draft.AnalysisObj.getDatum(id);
      if (datum2dObject instanceof Datum2D) {
        const processing2dController = datum2dObject.getProcessingController();
        if (shiftKey) {
          processing2dController.shiftWheel(deltaY);
        } else {
          processing2dController.wheel(deltaY);
        }
        const contours = Object.freeze(processing2dController.drawContours());
        draft.contours[id] = contours;
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

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
  setActiveTab,
  setTab,
};
