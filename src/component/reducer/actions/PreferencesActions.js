import { produce } from 'immer';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import { DEFAULT_YAXIS_SHIFT_VALUE } from '../core/Constants';

import { setDomain } from './DomainActions';
import { setZoom } from './ToolsActions';

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

export {
  changeSpectrumDisplayPreferences,
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
