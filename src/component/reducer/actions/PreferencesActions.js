import { produce } from 'immer';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';
import Spectrum2D from '../core/Spectrum2D';

import { setDomain } from './DomainActions';
import { setZoom, spectrumZoomHanlder } from './Zoom';

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
      margin,
      displayerMode,
      tabActiveSpectrum,
    } = state;
    if (activeTab) {
      const groupByNucleus = GroupByInfoKey('nucleus');
      const level =
        displayerMode === DISPLAYER_MODE.DM_2D
          ? Spectrum2D.getInstance().getLevel()
          : null;
      const spectrumsGroupsList = groupByNucleus(data);

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
        level,
        margin,
        data: spectrumsGroupsList[activeTab].reduce((acc, datum) => {
          acc[datum.id] = {
            color: datum.display.color,
            isVisible: datum.display.isVisible,
            isPeaksMarkersVisible: datum.display.isPeaksMarkersVisible,
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
            : { display: datum.display }),
        };
      });
      draft.displayerMode = preferences.displayerMode;
      draft.tabActiveSpectrum = preferences.tabActiveSpectrum;
      draft.activeSpectrum = preferences.activeSpectrum;
      // console.log()

      draft.margin = preferences.margin;

      setDomain(draft);

      draft.xDomain = preferences.xDomain;
      draft.xDomains = preferences.xDomains;
      draft.yDomain = preferences.yDomain;
      draft.yDomains = preferences.yDomains;

      if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
        const { levelPositive, levelNegative } = preferences.level;
        const spectrum2D = Spectrum2D.getInstance();
        spectrum2D.setLevel(levelPositive, levelNegative);
        draft.contours = spectrum2D.drawContours();
      } else {
        spectrumZoomHanlder.setScale(preferences.zoomFactor.scale);
        setZoom(state, draft, preferences.zoomFactor.scale);
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
