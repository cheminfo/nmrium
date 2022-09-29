import { v4 } from '@lukeed/uuid';
import { original, Draft } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { getYScale, getXScale } from '../../1d/utilities/scale';
import { LAYOUT } from '../../2d/utilities/DimensionLayout';
import { get2DYScale } from '../../2d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';
import groupByInfoKey from '../../utility/GroupByInfoKey';
import { rangeStateInit, State } from '../Reducer';
import { DISPLAYER_MODE, MARGIN } from '../core/Constants';
import { setZoom, wheelZoom, ZoomType } from '../helper/Zoom1DManager';
import zoomHistoryManager from '../helper/ZoomHistoryManager';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import { getActiveSpectrumOrFail } from '../helper/getActiveSpectrumOrFail';

import {
  setDomain,
  SetDomainOptions,
  setIntegralsYDomain,
  setMode,
} from './DomainActions';
import {
  calculateBaseLineCorrection,
  resetSpectrumByFilter,
  setFilterChanges,
} from './FiltersActions';
import { changeSpectrumVerticalAlignment } from './PreferencesActions';

function resetTool(draft: Draft<State>, setDefaultTool = true) {
  // reset temp range
  setSelectedOptionPanel(draft, null);
  if (setDefaultTool) {
    draft.toolOptions.selectedTool = options.zoom.id;
  }
  draft.toolOptions.data.baselineCorrection = { zones: [], options: [] };
  if (draft.toolOptions.data.activeFilterID) {
    resetSpectrumByFilter(draft);
  }

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

function setSelectedTool(draft: Draft<State>, action) {
  const { selectedTool } = action.payload;

  if (draft?.data.length > 0) {
    if (selectedTool) {
      // start Range edit mode
      if (selectedTool === options.editRange.id) {
        const activeSpectrum = getActiveSpectrumOrFail(draft);

        const range = draft.view.ranges.find(
          (r) => r.spectrumID === activeSpectrum?.id,
        );
        if (range) {
          range.showMultiplicityTrees = true;
        } else {
          draft.view.ranges.push({
            spectrumID: activeSpectrum.id,
            ...rangeStateInit,
            showMultiplicityTrees: true,
          });
        }
      }

      if (selectedTool !== draft.toolOptions.selectedTool) {
        resetTool(draft, false);
      }

      draft.toolOptions.selectedTool = selectedTool;

      if (options[selectedTool].hasOptionPanel) {
        setSelectedOptionPanel(draft, selectedTool);
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
  const align = ['stack', 'bottom'].includes(draft.verticalAlign.align)
    ? 'center'
    : 'bottom';
  changeSpectrumVerticalAlignment(draft, { align });
}

function handleChangeSpectrumDisplayMode(draft: Draft<State>) {
  const align = draft.verticalAlign.align === 'stack' ? 'bottom' : 'stack';
  changeSpectrumVerticalAlignment(draft, { align });
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
  const zones = draft.toolOptions.data.baselineCorrection.zones;
  zones.push({
    id: v4(),
    from: zone[0],
    to: zone[1],
  });
  draft.toolOptions.data.baselineCorrection.zones = zones.slice();

  calculateBaseLineCorrection(draft);
}

function handleDeleteBaseLineZone(draft: Draft<State>, id) {
  const state = original(draft) as State;
  draft.toolOptions.data.baselineCorrection.zones =
    state.toolOptions.data.baselineCorrection.zones.filter(
      (zone) => zone.id !== id,
    );
  calculateBaseLineCorrection(draft);
}

function handleToggleRealImaginaryVisibility(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum != null) {
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    datum.display.isRealSpectrumVisible = !datum.display.isRealSpectrumVisible;

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
  const brushHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
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
      brushHistory.push({ xDomain: draft.xDomain, yDomain: draft.yDomain });
    }
  } else {
    draft.xDomain = domainX;
    if (brushHistory) {
      brushHistory.push({ xDomain: domainX, yDomain: domainY });
    }
  }
}
function setVerticalIndicatorXPosition(draft: Draft<State>, position) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const scaleX = getXScale(draft);
    const value = scaleX.invert(position);
    const datum = draft.data[activeSpectrum.index] as Datum1D;
    const index = xFindClosestIndex(datum.data.x, value);
    draft.toolOptions.data.pivot = { value, index };
  }
}

function getSpectrumID(draft: Draft<State>, index): string | null {
  const spectrum =
    draft.view.spectra.activeSpectra[
      draft.view.spectra.activeTab.split(',')[index]
    ];
  return spectrum?.id || null;
}

function handleZoom(draft: Draft<State>, action) {
  const { event, trackID, selectedTool } = action;
  const {
    view: { ranges: rangeState },
    displayerMode,
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);
  const { showRangesIntegrals } =
    rangeState.find((r) => r.spectrumID === activeSpectrum?.id) ||
    rangeStateInit;
  if (displayerMode === DISPLAYER_MODE.DM_2D) {
    const index =
      trackID === LAYOUT.TOP_1D ? 0 : trackID === LAYOUT.LEFT_1D ? 1 : null;
    if (index !== null) {
      const id = getSpectrumID(draft, index);
      if (id) {
        const domain = draft.yDomains[id];
        draft.yDomains[id] = wheelZoom(event, domain);
      }
    }
  } else if (activeSpectrum?.id) {
    if (
      (showRangesIntegrals || selectedTool === options.integral.id) &&
      event.shiftKey
    ) {
      const domain = draft.integralsYDomains[activeSpectrum?.id];
      draft.integralsYDomains[activeSpectrum?.id] = wheelZoom(event, domain);
    } else {
      const domain = draft.yDomains[activeSpectrum?.id];
      draft.yDomains[activeSpectrum?.id] = wheelZoom(event, domain);
    }
  } else {
    for (const key of Object.keys(draft.yDomains)) {
      const domain = draft.yDomains[key];
      draft.yDomains[key] = wheelZoom(event, domain);
    }
  }
}

function zoomOut(draft: Draft<State>, action) {
  if (draft?.data.length > 0) {
    const { zoomType, trackID } = action;
    const zoomHistory = zoomHistoryManager(
      draft.zoom.history,
      draft.view.spectra.activeTab,
    );

    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      switch (zoomType) {
        case ZoomType.HORIZONTAL: {
          draft.xDomain = draft.originDomain.xDomain;
          zoomHistory.clear();
          break;
        }
        case ZoomType.VERTICAL:
          setZoom(draft, { scale: 0.8 });
          break;
        case ZoomType.STEP_HORIZONTAL: {
          const zoomValue = zoomHistory.pop();
          draft.xDomain = zoomValue
            ? zoomValue.xDomain
            : draft.originDomain.xDomain;
          setZoom(draft, { scale: 0.8 });
          break;
        }
        default: {
          draft.xDomain = draft.originDomain.xDomain;
          setZoom(draft, { scale: 0.8 });
          break;
        }
      }
    } else {
      const { xDomain, yDomain, yDomains } = draft.originDomain;

      if ([LAYOUT.TOP_1D, LAYOUT.LEFT_1D, LAYOUT.CENTER_2D].includes(trackID)) {
        const zoomValue = zoomHistory.pop();
        draft.xDomain = zoomValue ? zoomValue.xDomain : xDomain;
        draft.yDomain = zoomValue ? zoomValue.yDomain : yDomain;
      } else {
        zoomHistory.clear();
        draft.xDomain = xDomain;
        draft.yDomain = yDomain;
        draft.yDomains = yDomains;
      }
    }
  }
}

function hasAcceptedSpectrum(draft: Draft<State>, index) {
  const nucleuses = draft.view.spectra.activeTab.split(',');
  const activeSpectrum = draft.view.spectra.activeSpectra[nucleuses[index]];
  return (
    activeSpectrum?.id &&
    !(draft.data[activeSpectrum.index] as Datum1D).info.isFid
  );
}

function setMargin(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);
  const spectrum =
    (activeSpectrum?.id && draft.data[activeSpectrum.index]) || null;

  if (
    draft.displayerMode === DISPLAYER_MODE.DM_2D &&
    (draft.toolOptions.selectedTool === options.slicing.id ||
      spectrum?.info.isFid)
  ) {
    draft.margin = MARGIN['2D'];
  } else if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    const top = hasAcceptedSpectrum(draft, 0)
      ? MARGIN['2D'].top
      : MARGIN['1D'].top;
    const left = hasAcceptedSpectrum(draft, 1)
      ? MARGIN['2D'].left
      : MARGIN['1D'].left;
    draft.margin = { ...MARGIN['2D'], top, left };
  } else if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.margin = MARGIN['1D'];
  }
}

function processing2DData(draft: Draft<State>, data) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    let _data = {};
    for (const datum of data[draft.view.spectra.activeTab]) {
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
  draft.view.spectra.activeSpectra = tabActiveSpectrum;
  return tabs2D;
}

function setTab(draft: Draft<State>, dataGroupByTab, tab, refresh = false) {
  const groupByTab = Object.keys(dataGroupByTab).sort((a, b) =>
    a.split(',').length > b.split(',').length ? -1 : 1,
  );

  if (
    JSON.stringify(groupByTab) !==
      JSON.stringify(Object.keys(draft.view.spectra.activeSpectra)) ||
    refresh
  ) {
    const tabs2D = setTabActiveSpectrum(draft, dataGroupByTab);

    if (tabs2D.length > 0 && tab == null) {
      draft.view.spectra.activeTab = tabs2D[0];
    } else {
      draft.view.spectra.activeTab = tab;
    }
  } else {
    draft.view.spectra.activeTab = tab;
  }

  setDisplayerMode(draft, dataGroupByTab[draft.view.spectra.activeTab]);
  setMargin(draft);
}

interface SetActiveTabOptions {
  tab?: string | null;
  refreshActiveTab?: boolean;
  domainOptions?: SetDomainOptions;
}

function setActiveTab(draft: Draft<State>, options?: SetActiveTabOptions) {
  const {
    tab = null,
    refreshActiveTab = false,
    domainOptions = {},
  } = options || {};

  const groupByNucleus = groupByInfoKey('nucleus');
  const dataGroupByNucleus = groupByNucleus(draft.data, true);
  const tabs = Object.keys(dataGroupByNucleus);
  const currentTab = !tab || !tabs.includes(tab || '') ? tabs[0] : tab;
  setTab(draft, dataGroupByNucleus, currentTab, refreshActiveTab);
  resetTool(draft);

  processing2DData(draft, dataGroupByNucleus);

  setDomain(draft, domainOptions);
  setIntegralsYDomain(draft, dataGroupByNucleus[currentTab]);

  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
  setMode(draft);
}

function handelSetActiveTab(draft: Draft<State>, tab) {
  if (tab) {
    setActiveTab(draft, { tab });
  }
}

function levelChangeHandler(draft: Draft<State>, { deltaY, shiftKey }) {
  const activeSpectrum = getActiveSpectrum(draft);
  try {
    if (activeSpectrum?.id) {
      const { index, id } = activeSpectrum;
      const processingController = (draft.data[index] as Datum2D)
        .processingController;
      if (shiftKey) {
        processingController.shiftWheel(deltaY);
      } else {
        processingController.wheel(deltaY);
      }
      const contours = Object.freeze(processingController.drawContours());
      draft.contours[id] = contours;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

function setSpectraSameTopHandler(draft: Draft<State>) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    draft.originDomain.shareYDomain = false;
    setZoom(draft, { scale: 0.8 });
  }
}
function resetSpectraScale(draft: Draft<State>) {
  draft.originDomain.shareYDomain = true;
  draft.yDomains = draft.originDomain.yDomains;
  draft.yDomain = draft.originDomain.yDomain;
  setZoom(draft, { scale: 0.8 });
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
};
