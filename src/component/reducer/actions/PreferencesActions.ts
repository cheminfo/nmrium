import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import lodashGet from 'lodash/get';

import { Datum1D } from '../../../data/data1d/Spectrum1D';
import { Datum2D } from '../../../data/data2d/Spectrum2D';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';

import { setDomain } from './DomainActions';
import { setZoom } from './Zoom';

function handelSetPreferences(draft: Draft<State>, action) {
  const { type, values } = action;
  const panelsPreferences = lodashGet(draft.preferences, 'panels', {});
  draft.preferences.panels = { ...panelsPreferences, [type]: values };
}

function changeSpectrumVerticalAlignment(
  draft: Draft<State>,
  center,
  checkData = false,
) {
  if (draft.data && draft.data.length > 0) {
    if (
      center ||
      (checkData &&
        (draft.data[0] as Datum1D).info.isFid &&
        !(draft.data as Datum1D[]).some((d) => d.info.isFid === false))
    ) {
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
}

function setKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const state = original(draft) as State;
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

function applyKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const state = original(draft) as State;

  const preferences = state.keysPreferences[keyCode];
  if (preferences) {
    draft.activeTab = preferences.activeTab;
    (state.data as Datum1D[] | Datum2D[]).forEach((datum, index) => {
      if (nucleusToString(datum.info.nucleus) === preferences.activeTab) {
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
      for (const datumID of Object.keys(preferences.level)) {
        const { levelPositive, levelNegative } = preferences.level[datumID];
        const index = state.data.findIndex((datum) => datum.id === datumID);
        const processController = (draft.data[index] as Datum2D)
          .processingController;
        processController.setLevel(levelPositive, levelNegative);
        draft.contours[datumID] = processController.drawContours();
      }
    } else {
      setZoom(draft, preferences.zoomFactor.scale);
    }
  }
}

export {
  changeSpectrumVerticalAlignment,
  handelSetPreferences,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
