import { Draft } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import groupByInfoKey from '../../utility/GroupByInfoKey';
import nucleusToString from '../../utility/nucleusToString';
import { State, VerticalAlignment } from '../Reducer';
import { DEFAULT_YAXIS_SHIFT_VALUE, DISPLAYER_MODE } from '../core/Constants';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';

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
  function stack(spectra: Datum1D[] = []) {
    if (spectra.length > 1) {
      draft.verticalAlign.align = 'stack';
      const visibleSpectra = spectra.filter((datum) => datum.display.isVisible);
      draft.verticalAlign.verticalShift = Math.abs(
        Math.floor(
          (draft.height - draft.margin.bottom) / (visibleSpectra.length + 2),
        ),
      );
    }
  }

  function center() {
    const YAxisShift = draft.height / 2;
    draft.verticalAlign.align = 'center';
    draft.verticalAlign.verticalShift = YAxisShift;
  }

  function bottom() {
    draft.verticalAlign.align = 'bottom';
    draft.verticalAlign.verticalShift = DEFAULT_YAXIS_SHIFT_VALUE;
  }

  if (draft.data && draft.data.length > 0) {
    let dataPerNucleus: Datum1D[] = [];
    if (['auto-check', 'stack'].includes(options.align || '')) {
      dataPerNucleus = (draft.data as Datum1D[]).filter((datum) =>
        datum.info.nucleus === options?.activeTab
          ? options.activeTab
          : draft.view.spectra.activeTab && datum.info.dimension === 1,
      );
    }

    switch (options.align) {
      case 'auto-check': {
        const isFid =
          dataPerNucleus[0]?.info.isFid &&
          !dataPerNucleus.some((d) => !d.info.isFid);
        if (isFid) {
          center();
        } else if (dataPerNucleus.length > 1) {
          stack(dataPerNucleus);
        }
        break;
      }
      case 'bottom': {
        return bottom();
      }
      case 'center': {
        return center();
      }

      case 'stack': {
        return stack(dataPerNucleus);
      }

      default:
    }
  }
}

function setKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const {
    data,

    zoom,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
    originDomain,
    margin,
    displayerMode,
    view,
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  if (view.spectra.activeTab) {
    const groupByNucleus = groupByInfoKey('nucleus');

    const spectrumsGroupsList = groupByNucleus(data);

    let level: any = {};
    if (displayerMode === DISPLAYER_MODE.DM_2D) {
      spectrumsGroupsList[view.spectra.activeTab].forEach((datum) => {
        level[datum.id] = datum.processingController.getLevel();
      });
    } else {
      level = null;
    }
    const _data = {};
    spectrumsGroupsList[view.spectra.activeTab].forEach((datum) => {
      _data[datum.id] = {
        display: {
          color: datum.display.color,
          isVisible: datum.display.isVisible,
          isPeaksMarkersVisible: datum.display.isPeaksMarkersVisible,
        },
      };
    });
    draft.keysPreferences[keyCode] = {
      activeSpectrum,
      displayerMode,
      view,
      zoom,
      xDomain,
      xDomains,
      yDomain,
      yDomains,
      originDomain,
      level,
      margin,
      data: _data,
    };
  }
}

function applyKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const preferences = draft.keysPreferences[keyCode];
  if (preferences) {
    (draft.data as Datum1D[] | Datum2D[]).forEach((datum, index) => {
      if (nucleusToString(datum.info.nucleus) === preferences.activeTab) {
        draft.data[index].display = Object.assign(
          cloneDeep(datum.display),
          preferences.data[datum.id].display,
        );
      }
    });
    draft.view = preferences.view;
    draft.displayerMode = preferences.displayerMode;

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
