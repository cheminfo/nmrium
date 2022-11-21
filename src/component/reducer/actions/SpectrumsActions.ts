import { Draft, original } from 'immer';

import * as Filters from '../../../data/Filters';
import { applyFilter } from '../../../data/FiltersManager';
import {
  generateSpectrumFromPublicationString,
  getReferenceShift,
} from '../../../data/data1d/Spectrum1D';
import {
  getMissingProjection,
  isSpectrum2D,
} from '../../../data/data2d/Spectrum2D';
import { contoursManager } from '../../../data/data2d/Spectrum2D/contours';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { options } from '../../toolbar/ToolTypes';
import groupByInfoKey from '../../utility/GroupByInfoKey';
import { State } from '../Reducer';
import { setZoom } from '../helper/Zoom1DManager';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';

import { setDomain, setMode } from './DomainActions';
import { resetSpectrumByFilter } from './FiltersActions';
import { setTab, setActiveTab } from './ToolsActions';

function checkIsVisible2D(datum: Datum2D): boolean {
  if (!datum.display.isPositiveVisible && !datum.display.isNegativeVisible) {
    return false;
  }
  return true;
}

function setVisible(datum, flag) {
  if (datum.info.dimension === 2) {
    (datum as Datum2D).display.isPositiveVisible = flag;
    (datum as Datum2D).display.isNegativeVisible = flag;
    (datum as Datum2D).display.isVisible = checkIsVisible2D(datum as Datum2D);
  } else {
    (datum as Datum1D).display.isVisible = flag;
  }
}

function handleSpectrumVisibility(draft: Draft<State>, action) {
  if (Array.isArray(action.id)) {
    const IDs = action.id;
    if (IDs.length === 0) {
      for (const datum of draft.data) {
        setVisible(datum, false);
      }
    } else {
      for (const datum of draft.data) {
        if (IDs.includes(datum.id)) {
          setVisible(datum, true);
        } else {
          setVisible(datum, false);
        }
      }
    }
  } else {
    const index = draft.data.findIndex((d) => d.id === action.id);
    (draft.data[index] as Datum1D | Datum2D).display[action.key] = action.value;

    if ((draft.data[index] as Datum1D | Datum2D).info.dimension === 2) {
      (draft.data[index] as Datum2D).display.isVisible = checkIsVisible2D(
        draft.data[index] as Datum2D,
      );
    }
  }
}

function handleChangeActiveSpectrum(draft: Draft<State>, activeSpectrum) {
  let refreshDomain = false;
  const currentActiveSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const newIndex = draft.data.findIndex((d) => d.id === activeSpectrum.id);
    const oldIndex = draft.data.findIndex(
      (d) => d.id === currentActiveSpectrum?.id,
    );
    if (newIndex !== -1) {
      const newActiveSpectrum = draft.data[newIndex] as Datum1D | Datum2D;

      newActiveSpectrum.display.isVisible = true;

      if (oldIndex !== -1) {
        refreshDomain =
          (draft.data[oldIndex] as Datum1D | Datum2D).info.isFid !==
          newActiveSpectrum.info.isFid;
      } else {
        refreshDomain = newActiveSpectrum.info.isFid || false;
      }
    }
    activeSpectrum = { ...activeSpectrum, index: newIndex };
    draft.view.spectra.activeSpectra[draft.view.spectra.activeTab] =
      activeSpectrum;
  } else {
    if (currentActiveSpectrum) {
      const index = draft.data.findIndex(
        (d) => d.id === currentActiveSpectrum.id,
      );
      refreshDomain = draft.data[index].info.isFid;
    } else {
      refreshDomain = false;
    }
    draft.view.spectra.activeSpectra[draft.view.spectra.activeTab] = null;
  }

  if (options[draft.toolOptions.selectedTool].isFilter) {
    draft.toolOptions.selectedTool = options.zoom.id;
    draft.toolOptions.data.baselineCorrection = { zones: [], options: {} };
    draft.toolOptions.selectedOptionPanel = null;
    draft.tempData = null;
  }

  /**
   * if the active spectrum not is FID then dont refresh the domain and the mode when the first time you activate soectrum
   * if the new active spectrum different than the previous active spectrum fid then refresh the domain andf the mode.
   */
  if (draft.toolOptions.data.activeFilterID) {
    resetSpectrumByFilter(draft);
  } else if (refreshDomain) {
    setDomain(draft);
    setMode(draft);
  }
}

function changeSpectrumSetting(draft: Draft<State>, { id, display }) {
  const index = draft.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    const spectrum = draft.data[index];
    spectrum.display = display;
    if (isSpectrum2D(spectrum)) {
      const contoursLevels = draft.view.zoom.levels;
      const { checkLevel } = contoursManager(
        spectrum.id,
        contoursLevels,
        spectrum.display.contourOptions,
      );
      contoursLevels[spectrum.id] = checkLevel();
    }
  }
}

function handleChangeSpectrumColor(draft: Draft<State>, { id, color, key }) {
  const state = original(draft) as State;
  const index = state.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    (draft.data[index] as Datum1D | Datum2D).display[key] = color;
  }
}

function handleDeleteSpectra(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (action.id) {
    const index = state.data.findIndex((d) => d.id === action.id);
    draft.data.splice(index, 1);

    // remove peaks State
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete draft.view.peaks[action.id];
  } else {
    draft.data = [];
    draft.view.peaks = {};
  }
  setActiveTab(draft, {
    tab: draft.view.spectra.activeTab,
    refreshActiveTab: true,
  });
}
function addMissingProjectionHandler(draft, action) {
  const state = original(draft);
  const { nucleus } = action;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    for (let n of nucleus) {
      const datum1D = getMissingProjection(
        state.data[index],
        n,
        draft.usedColors,
      );
      draft.data.push(datum1D);
    }
    const groupByNucleus = groupByInfoKey('nucleus');
    const dataGroupByNucleus = groupByNucleus(draft.data);
    setTab(draft, dataGroupByNucleus, draft.activeTab, true);
    setDomain(draft);
    setMode(draft);
  }
}
function alignSpectraHandler(draft: Draft<State>, action) {
  if (draft.data && draft.data.length > 0) {
    for (let datum of draft.data) {
      if (
        datum.info?.dimension === 1 &&
        datum.info.nucleus === draft.view.spectra.activeTab &&
        !datum.info?.isFid
      ) {
        const shift = getReferenceShift(datum, { ...action.payload });
        applyFilter(datum, [
          {
            name: Filters.shiftX.id,
            options: shift,
          },
        ]);
      }
    }
  }

  setDomain(draft);
  setMode(draft);
}

function generateSpectrumFromPublicationStringHandler(
  draft: Draft<State>,
  action,
) {
  const publicationString = action.payload.publicationText;

  const spectrum = generateSpectrumFromPublicationString(
    publicationString,
    draft.usedColors,
  );
  draft.data.push(spectrum);
  setActiveTab(draft);
  setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });
}

export {
  handleSpectrumVisibility,
  handleChangeActiveSpectrum,
  handleChangeSpectrumColor,
  changeSpectrumSetting,
  handleDeleteSpectra,
  addMissingProjectionHandler,
  alignSpectraHandler,
  generateSpectrumFromPublicationStringHandler,
};
