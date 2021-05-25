import { max } from 'd3';
import { original, Draft } from 'immer';

import { Filters } from '../../../data/Filters';
import { Data1D, Datum1D } from '../../../data/data1d/Spectrum1D';
import { Datum2D } from '../../../data/data2d/Spectrum2D';
import generateID from '../../../data/utilities/generateID';
import { getYScale, getXScale } from '../../1d/utilities/scale';
import { LAYOUT } from '../../2d/utilities/DimensionLayout';
import { get2DYScale } from '../../2d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { State } from '../Reducer';
import {
  DEFAULT_YAXIS_SHIFT_VALUE,
  DISPLAYER_MODE,
  MARGIN,
} from '../core/Constants';
import zoomHistoryManager from '../helper/ZoomHistoryManager';

import { setDomain, setMode } from './DomainActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setZoom1D, setZoom, ZoomType, wheel } from './Zoom';

function getStrongestPeak(draft: Draft<State>) {
  const { activeSpectrum, data } = draft;
  const activeData = data[activeSpectrum.index].data as Data1D;
  const strongestPeakValue = max(activeData.y);
  const index = activeData.y.findIndex((val) => val === strongestPeakValue);
  return {
    xValue: activeData.x[index],
    yValue: strongestPeakValue,
    index: index,
  };
}

function setFilterChanges(draft: Draft<State>, selectedFilter) {
  const activeSpectrumId = draft.activeSpectrum.id;

  //save reduced snapshot
  //select the equalizer tool when you enable manual phase correction filter
  if (selectedFilter === Filters.phaseCorrection.id) {
    draft.tempData = draft.data;

    const { xValue } = getStrongestPeak(draft);
    draft.toolOptions.data.pivot = xValue;
  } else {
    if (draft.toolOptions.selectedTool === options.phaseCorrection.id) {
      const spectrumIndex = draft.data.findIndex(
        (spectrum) => spectrum.id === activeSpectrumId,
      );

      draft.data[spectrumIndex].data = draft.tempData[spectrumIndex].data;
    }
  }
}

function resetTool(draft: Draft<State>, setDefaultTool = true) {
  draft.toolOptions.selectedOptionPanel = null;
  if (setDefaultTool) {
    draft.toolOptions.selectedTool = options.zoom.id;
  }
  draft.toolOptions.data.baseLineZones = [];
  if (draft.tempData) {
    draft.tempData = null;
    setDomain(draft);
  }
}

function resetSelectedTool(draft: Draft<State>, filterOnly = false) {
  if (
    (draft.toolOptions.selectedTool &&
      options[draft.toolOptions.selectedTool].isFilter) ||
    !filterOnly
  ) {
    resetTool(draft);
  }
}

function setSelectedTool(draft: Draft<State>, selectedTool) {
  if (draft?.data.length > 0) {
    if (selectedTool) {
      if (selectedTool !== draft.toolOptions.selectedTool) {
        resetTool(draft, false);
      }
      draft.toolOptions.selectedTool = selectedTool;
      if (options[selectedTool].hasOptionPanel) {
        draft.toolOptions.selectedOptionPanel = selectedTool;
      }

      if (options[selectedTool].isFilter) {
        setFilterChanges(draft, selectedTool);
      }
    } else {
      resetTool(draft, false);
    }
    setMargin(draft);
  }
}

function setSelectedOptionPanel(draft: Draft<State>, selectedOptionPanel) {
  draft.toolOptions.selectedOptionPanel = selectedOptionPanel;
}

function setSpectrumsVerticalAlign(draft: Draft<State>) {
  changeSpectrumVerticalAlignment(draft, !draft.verticalAlign.flag);
}

function handleChangeSpectrumDisplayMode(draft: Draft<State>) {
  const state = original(draft) as State;
  const { activeSpectrum, height, activeTab } = draft;
  let YAxisShift = DEFAULT_YAXIS_SHIFT_VALUE;
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    if ((state.data[index] as Datum1D).info.isFid) {
      YAxisShift = height / 2;
    }
  }
  draft.verticalAlign.flag = !draft.verticalAlign.stacked;
  draft.verticalAlign.stacked = !draft.verticalAlign.stacked;

  if (draft.verticalAlign.stacked) {
    const count = (state.data as Datum1D[]).filter(
      (datum) => datum.info.nucleus === activeTab,
    ).length;
    draft.verticalAlign.value = Math.floor(height / (count + 2));
  } else {
    draft.verticalAlign.value = YAxisShift;
  }
}

function handleAddBaseLineZone(draft: Draft<State>, { from, to }) {
  const scaleX = getXScale(draft);

  let start = scaleX.invert(from);
  const end = scaleX.invert(to);

  let zone: any = [];
  if (start > end) {
    zone = [end, start];
  } else {
    zone = [start, end];
  }

  const zones = draft.toolOptions.data.baseLineZones.slice();
  zones.push({
    id: generateID(),
    from: zone[0],
    to: zone[1],
  });
  draft.toolOptions.data.baseLineZones = zones;
}

function handleDeleteBaseLineZone(draft: Draft<State>, id) {
  const state = original(draft) as State;
  draft.toolOptions.data.baseLineZones =
    state.toolOptions.data.baseLineZones.baseLineZones.filter(
      (zone) => zone.id !== id,
    );
}

function handleToggleRealImaginaryVisibility(draft) {
  if (draft.activeSpectrum != null) {
    const { index } = draft.activeSpectrum;

    draft.data[index].display.isRealSpectrumVisible =
      !draft.data[index].display.isRealSpectrumVisible;
    if (draft.data[index].display.isRealSpectrumVisible) {
      const re = draft.data[index].data.re;
      if (re !== null && re !== undefined) {
        draft.data[index].data.y = re;
      }
    } else {
      const im = draft.data[index].data.im;

      if (im !== null && im !== undefined) {
        draft.data[index].data.y = im;
      }
    }

    setDomain(draft);
  }
}

function handleBrushEnd(draft: Draft<State>, action) {
  const is2D = draft.displayerMode === DISPLAYER_MODE.DM_2D;
  const xScale = getXScale(draft);

  const yScale = is2D ? get2DYScale(draft) : getYScale(draft);

  const startX = xScale.invert(action.startX);
  const endX = xScale.invert(action.endX);
  const startY = yScale.invert(action.startY);
  const endY = yScale.invert(action.endY);
  const domainX = startX > endX ? [endX, startX] : [startX, endX];
  const domainY = startY > endY ? [endY, startY] : [startY, endY];
  const brushHistory = zoomHistoryManager(draft.ZoomHistory, draft.activeTab);
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
      brushHistory.push({ xDomain: domainX, yDomain: domainY });
    }
  }
}
function setVerticalIndicatorXPosition(draft: Draft<State>, position) {
  const scaleX = getXScale(draft);
  draft.toolOptions.data.pivot = scaleX.invert(position);
}

function getSpectrumID(draft: Draft<State>, index) {
  return draft.tabActiveSpectrum[draft.activeTab.split(',')[index]].id;
}

function handleZoom(draft: Draft<State>, action) {
  const { deltaY, deltaMode, trackID } = action;
  if (trackID) {
    switch (trackID) {
      case LAYOUT.TOP_1D: {
        const id = getSpectrumID(draft, 0);
        wheel(deltaY, deltaMode, draft, id);
        setZoom1D(draft, draft.margin.top, 10, 0);
        break;
      }
      case LAYOUT.LEFT_1D: {
        const id = getSpectrumID(draft, 1);
        wheel(deltaY, deltaMode, draft, id);
        setZoom1D(draft, draft.margin.left, 10, 1);
        break;
      }
      default:
        break;
    }
  } else {
    wheel(deltaY, deltaMode, draft);
    setZoom(draft);
  }
}

function zoomOut(draft: Draft<State>, action) {
  if (draft?.data.length > 0) {
    const { zoomType, trackID } = action;
    const zoomHistory = zoomHistoryManager(draft.ZoomHistory, draft.activeTab);

    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      switch (zoomType) {
        case ZoomType.HORIZONTAL: {
          draft.xDomain = draft.originDomain.xDomain;
          break;
        }
        case ZoomType.VERTICAL:
          setZoom(draft, 0.8);
          break;
        case ZoomType.STEP_HROZENTAL: {
          const zoomValue = zoomHistory.pop();
          draft.xDomain = zoomValue
            ? zoomValue.xDomain
            : draft.originDomain.xDomain;
          setZoom(draft, 0.8);
          break;
        }
        default: {
          draft.xDomain = draft.originDomain.xDomain;
          setZoom(draft, 0.8);
          break;
        }
      }
    } else {
      const { xDomain, yDomain, yDomains } = draft.originDomain;
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
}

function hasAcceptedSpectrum(draft: Draft<State>, index) {
  const nucleuses = draft.activeTab.split(',');
  return (
    draft.tabActiveSpectrum[nucleuses[index]] &&
    !(draft.data[draft.tabActiveSpectrum[nucleuses[index]].index] as Datum1D)
      .info.isFid
  );
}

function setMargin(draft: Draft<State>) {
  if (
    draft.displayerMode === DISPLAYER_MODE.DM_2D &&
    draft.toolOptions.selectedTool !== options.slicingTool.id
  ) {
    const top = hasAcceptedSpectrum(draft, 0)
      ? MARGIN['2D'].top
      : MARGIN['1D'].top;
    const left = hasAcceptedSpectrum(draft, 1)
      ? MARGIN['2D'].left
      : MARGIN['1D'].left;
    draft.margin = { ...MARGIN['2D'], top, left };
  } else if (draft.toolOptions.selectedTool === options.slicingTool.id) {
    draft.margin = MARGIN['2D'];
  } else if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.margin = MARGIN['1D'];
  }
}

function Processing2DData(draft: Draft<State>, data) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    let _data = {};
    for (const datum of data[draft.activeTab]) {
      _data[datum.id] = datum.processingController.drawContours();
    }
    draft.contours = _data;
  }
}

function setDisplayerMode(draft: Draft<State>, data) {
  draft.displayerMode =
    data && (data as Datum1D[] | Datum2D[]).some((d) => d.info.dimension === 2)
      ? DISPLAYER_MODE.DM_2D
      : DISPLAYER_MODE.DM_1D;
}

function setTabActiveSpectrum(draft: Draft<State>, dataGroupByTab) {
  let tabs2D: any[] = [];
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

function setTab(draft: Draft<State>, dataGroupByTab, tab, refresh = false) {
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

function setActiveTab(
  draft: Draft<State>,
  tab = null,
  refreshTabActiveSpectrums = false,
) {
  const groupByNucleus = GroupByInfoKey('nucleus');
  const dataGroupByNucleus = groupByNucleus(draft.data);
  const tabs = Object.keys(dataGroupByNucleus);
  const currentTab = !tab || !tabs.includes(tab ?? '') ? tabs[0] : tab;
  setTab(draft, dataGroupByNucleus, currentTab, refreshTabActiveSpectrums);
  resetTool(draft);
  // resetFilterTool(draft);

  Processing2DData(draft, dataGroupByNucleus);
  setDomain(draft);

  const zoomHistory = zoomHistoryManager(draft.ZoomHistory, draft.activeTab);
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
  setMode(draft);
}

function handelSetActiveTab(draft: Draft<State>, tab) {
  if (tab) {
    setActiveTab(draft, tab);
  }
}

function levelChangeHandler(draft: Draft<State>, { deltaY, shiftKey }) {
  try {
    if (draft.activeSpectrum?.id) {
      const { index, id } = draft.activeSpectrum;
      // const datum2dObject = AnalysisObj.getDatum(id);
      // if (datum2dObject instanceof Datum2D) {
      const processingController = (draft.data[index] as Datum2D)
        .processingController;
      // const processing2dController = processingController.drawContours;
      if (shiftKey) {
        processingController.shiftWheel(deltaY);
      } else {
        processingController.wheel(deltaY);
      }
      const contours = Object.freeze(processingController.drawContours());
      draft.contours[id] = contours;
      // }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

function setSpectraSameTopHandler(draft: Draft<State>) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.originDomain.yDomains = draft.originDomain.originYDomains;
    setZoom(draft, 0.8);
  }
}
function resetSpectraScale(draft: Draft<State>) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, key) => {
      acc[key] = draft.originDomain.yDomain;
      return acc;
    }, {});
    draft.originDomain.yDomains = draft.yDomains;
    draft.yDomain = draft.originDomain.yDomain;
  }
}

function handleAddExclusionZone(draft: Draft<State>, action) {
  const { from, to } = action.payload;
  const scaleX = getXScale(draft);

  const start = scaleX.invert(from);
  const end = scaleX.invert(to);

  let zone: any = [];
  if (start > end) {
    zone = [end, start];
  } else {
    zone = [start, end];
  }
  const newExclusionZone = {
    id: generateID(),
    from: zone[0],
    to: zone[1],
  };
  if (draft.toolOptions.data.exclusionZones[draft.activeTab]) {
    draft.toolOptions.data.exclusionZones[draft.activeTab].push(
      newExclusionZone,
    );
  } else {
    draft.toolOptions.data.exclusionZones[draft.activeTab] = [
      newExclusionZone,
    ];
  }
}

function handleDeleteExclusionZone(draft: Draft<State>, action) {
  const id = action.payload.id;
  const index = draft.toolOptions.data.exclusionZones[
    draft.activeTab
  ].findIndex((zone) => zone.id === id);
  draft.toolOptions.data.exclusionZones[draft.activeTab].splice(index, 1);
}

export {
  resetSelectedTool,
  setSelectedTool,
  setSelectedOptionPanel,
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
  setSpectraSameTopHandler,
  resetSpectraScale,
  handleAddExclusionZone,
  handleDeleteExclusionZone,
};
