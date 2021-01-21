import { produce } from 'immer';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';

import { setDomain } from './DomainActions';
import { setZoom } from './Zoom';

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
              acc[datum.id] = AnalysisObj.getDatum(datum.id)
                .getProcessingController()
                .getLevel();
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
  });
};

const nucluesToString = (nuclues) => {
  return typeof nuclues === 'string' ? nuclues : nuclues.join(',');
};

const applyKeyPreferencesHandler = (state, keyCode) => {
  return produce(state, (draft) => {
    const preferences = state.keysPreferences[keyCode];
    if (preferences) {
      draft.activeTab = preferences.activeTab;
      draft.data = state.data.map((datum) => {
        return {
          ...datum,
          ...(nucluesToString(datum.info.nucleus) === preferences.activeTab
            ? {
                display: {
                  ...datum.display,
                  ...preferences.data[datum.id].display,
                },
              }
            : {}),
        };
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
          const processController = AnalysisObj.getDatum(
            datumID,
          ).getProcessingController();
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
  });
};

export {
  changeSpectrumDisplayPreferences,
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
