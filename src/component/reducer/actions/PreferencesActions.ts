import { Draft } from 'immer';
import { Spectrum1D } from 'nmr-load-save';

import groupByInfoKey from '../../utility/GroupByInfoKey';
import nucleusToString from '../../utility/nucleusToString';
import { State, VerticalAlignment } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';

import { setDomain } from './DomainActions';

interface AlignmentOptions {
  verticalAlign?: VerticalAlignment | 'auto-check';
  activeTab?: string;
}

function changeSpectrumVerticalAlignment(
  draft: Draft<State>,
  options: AlignmentOptions,
) {
  const { verticalAlign = 'bottom', activeTab } = options;
  const nucleus = activeTab || draft.view.spectra.activeTab;

  if (draft.data && draft.data.length > 0) {
    let dataPerNucleus: Spectrum1D[] = [];
    if (['auto-check', 'stack'].includes(options.verticalAlign || '')) {
      dataPerNucleus = (draft.data as Spectrum1D[]).filter(
        (datum) => datum.info.nucleus === nucleus && datum.info.dimension === 1,
      );
    }
    if (nucleus) {
      if (verticalAlign === 'auto-check') {
        const isFid =
          dataPerNucleus[0]?.info.isFid &&
          !dataPerNucleus.some((d) => !d.info.isFid);

        if (isFid) {
          draft.view.verticalAlign[nucleus] = 'center';
        } else {
          let hasMoreThanOnFt = false;
          let count = 1;
          for (const spectrum of dataPerNucleus) {
            if (count > 1) {
              hasMoreThanOnFt = true;
              break;
            }
            if (spectrum.info.isFt) {
              count++;
            }
          }
          if (hasMoreThanOnFt) {
            draft.view.verticalAlign[nucleus] = 'stack';
          } else {
            draft.view.verticalAlign[nucleus] = 'bottom';
          }
        }
      } else {
        draft.view.verticalAlign[nucleus] = verticalAlign;
      }
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
    keysPreferences,
  } = draft;

  const {
    spectra: { activeTab },
  } = view;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeTab) {
    const groupByNucleus = groupByInfoKey('nucleus');
    const spectrumsGroupsList = groupByNucleus(data);
    const spectra = spectrumsGroupsList[activeTab];
    keysPreferences[keyCode] = {
      activeSpectrum,
      displayerMode,
      view,
      zoom,
      xDomain,
      xDomains,
      yDomain,
      yDomains,
      originDomain,
      margin,
      data: spectra,
    };
  }
}
function setSpectraDisplayPreferences(draft: Draft<State>, preferences) {
  for (const [index, datum] of draft.data.entries()) {
    if (nucleusToString(datum.info.nucleus) === preferences.activeTab) {
      draft.data[index].display = {
        ...datum.display,
        ...preferences.data[datum.id].display,
      };
    }
  }
}

function applyKeyPreferencesHandler(draft: Draft<State>, keyCode) {
  const preferences = draft.keysPreferences[keyCode];
  if (preferences) {
    setSpectraDisplayPreferences(draft, preferences);
    draft.view = preferences.view;
    draft.displayerMode = preferences.displayerMode;

    draft.margin = preferences.margin;

    setDomain(draft);

    draft.xDomain = preferences.xDomain;
    draft.xDomains = preferences.xDomains;
    draft.yDomain = preferences.yDomain;
    draft.originDomain = preferences.originDomain;
    draft.yDomains = preferences.yDomains;

    if (draft.displayerMode !== DISPLAYER_MODE.DM_2D) {
      draft.zoom = preferences.zoom;
    }
  }
}

export {
  changeSpectrumVerticalAlignment,
  setKeyPreferencesHandler,
  applyKeyPreferencesHandler,
};
