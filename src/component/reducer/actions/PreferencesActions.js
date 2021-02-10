import { original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import lodashGet from 'lodash/get';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';

import { setDomain } from './DomainActions';
import { setZoom } from './Zoom';

function handelSetPreferences(draft, action) {
  const { type, values } = action;
  const panelsPreferences = lodashGet(draft.preferences, 'panels', {});
  draft.preferences.panels = { ...panelsPreferences, [type]: values };
}

function changeSpectrumDisplayPreferences(draft, { center }) {
  if (center) {
    const YAxisShift = draft.height / 2;
    draft.verticalAlign.flag = true;
    draft.verticalAlign.value = YAxisShift;
    draft.verticalAlign.stacked = false;
  } else {
    draft.verticalAlign.flag = false;
    draft.verticalAlign.value = DEFAULT_YAXIS_SHIFT_VALUE;
    draft.verticalAlign.stacked = false;
  }
}

function setKeyPreferencesHandler(draft, keyCode) {
  const state = original(draft);
  const {
    activeTab,
    data,
    activeSpectrum,
    zoomFactor,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
    originDomain,
    margin,
    displayerMode,
    tabActiveSpectrum,
  } = state;
  if (activeTab) {
    const groupByNucleus = GroupByInfoKey('nucleus');

    const spectrumsGroupsList = groupByNucleus(data);

    const level =
      displayerMode === DISPLAYER_MODE.DM_2D
        ? spectrumsGroupsList[activeTab].reduce((acc, datum) => {
            acc[datum.id] = datum.processingController.getLevel();
            return acc;
          }, {})
        : null;

    draft.keysPreferences[keyCode] = {
      activeTab,
      activeSpectrum,
      displayerMode,
      tabActiveSpectrum,
      zoomFactor,
      xDomain,
      xDomains,
      yDomain,
      yDomains,
      originDomain,
      level,
      margin,
      data: spectrumsGroupsList[activeTab].reduce((acc, datum) => {
        acc[datum.id] = {
          display: {
            color: datum.display.color,
            isVisible: datum.display.isVisible,
            isPeaksMarkersVisible: datum.display.isPeaksMarkersVisible,
          },
        };
        return acc;
      }, {}),
    };
  }
}

function nucluesToString(nuclues) {
  return typeof nuclues === 'string' ? nuclues : nuclues.join(',');
}

function applyKeyPreferencesHandler(draft, keyCode) {
  const state = original(draft);

  const preferences = state.keysPreferences[keyCode];
  if (preferences) {
    draft.activeTab = preferences.activeTab;
    state.data.forEach((datum, index) => {
      if (nucluesToString(datum.info.nucleus) === preferences.activeTab) {
        draft.data[index].display = Object.assign(
          cloneDeep(datum.display),
          preferences.data[datum.id].display,
        );
      }
    });
    draft.displayerMode = preferences.displayerMode;
    draft.tabActiveSpectrum = preferences.tabActiveSpectrum;
    draft.activeSpectrum = preferences.activeSpectrum;

    draft.margin = preferences.margin;

    setDomain(draft);

    draft.xDomain = preferences.xDomain;
    draft.xDomains = preferences.xDomains;
    draft.yDomain = preferences.yDomain;
    draft.originDomain = preferences.originDomain;
    draft.yDomains = preferences.yDomains;

    if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
      // draft.yDomains = preferences.yDomains;

      for (const datumID of Object.keys(preferences.level)) {
        const { levelPositive, levelNegative } = preferences.level[datumID];
        const index = state.data.findIndex((datum) => datum.id === datumID);
        const processController = draft.data[index].processingController;
        processController.setLevel(levelPositive, levelNegative);
        draft.contours[datumID] = processController.drawContours();
      }
    } else {
      setZoom(
        {
          ...state,
          activeSpectrum: draft.activeSpectrum,
          activeTab: draft.activeTab,
        },
        draft,
        preferences.zoomFactor.scale,
      );
    }
  }
}

export {
  changeSpectrumDisplayPreferences,
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
