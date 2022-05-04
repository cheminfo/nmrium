import { Draft } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import nucleusToString from '../../utility/nucleusToString';
import { State, VerticalAlignment } from '../Reducer';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';

import { setDomain } from './DomainActions';

interface AlignmentOptions {
  align?: VerticalAlignment | 'auto-check';
  checkData?: boolean;
  activeTab?: string;
}

function changeSpectrumVerticalAlignment(
  draft: Draft<State>,
  options: AlignmentOptions,
) {
  if (draft.data && draft.data.length > 0) {
    let dataPerNucleus: Datum1D[] = [];
    if (['auto-check', 'stack'].includes(options.align || '')) {
      dataPerNucleus = (draft.data as Datum1D[]).filter((datum) =>
        datum.info.nucleus === options?.activeTab
          ? options.activeTab
          : draft.activeTab && datum.info.dimension === 1,
      );
    }

    switch (options.align) {
      case 'auto-check':
      case 'bottom':
      case 'center': {
        if (
          options.align === 'center' ||
          (options.align === 'auto-check' &&
            dataPerNucleus[0]?.info.isFid &&
            !dataPerNucleus.some((d) => d.info.isFid === false))
        ) {
          const YAxisShift = draft.height / 2;
          draft.verticalAlign.align = 'center';
          draft.verticalAlign.verticalShift = YAxisShift;
        } else {
          draft.verticalAlign.align = 'bottom';
          draft.verticalAlign.verticalShift = DEFAULT_YAXIS_SHIFT_VALUE;
        }
        break;
      }

      case 'stack': {
        draft.verticalAlign.align = 'stack';
        const visibleSpectra = dataPerNucleus.filter(
          (datum) => datum.display.isVisible === true,
        );
        draft.verticalAlign.verticalShift = Math.abs(
          Math.floor(
            (draft.height - draft.margin.bottom) / (visibleSpectra.length + 2),
          ),
        );
        break;
      }

      default:
        return;
    }
  }
}

function setKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const {
    activeTab,
    data,
    activeSpectrum,
    zoom,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
    originDomain,
    margin,
    displayerMode,
    tabActiveSpectrum,
  } = draft;

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
      zoom,
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
  const preferences = draft.keysPreferences[keyCode];
  if (preferences) {
    draft.activeTab = preferences.activeTab;
    (draft.data as Datum1D[] | Datum2D[]).forEach((datum, index) => {
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
        const index = draft.data.findIndex((datum) => datum.id === datumID);
        const processController = (draft.data[index] as Datum2D)
          .processingController;
        processController.setLevel(levelPositive, levelNegative);

        draft.contours[datumID] = processController.drawContours();
      }
    } else {
      draft.zoom = preferences.zoom;
    }
  }
}

export {
  changeSpectrumVerticalAlignment,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
