import { Draft, original } from 'immer';

import { Datum1D } from '../../../data/data1d/Datum1D';
import { applyFilter } from '../../../data/data1d/FiltersManager';
import { Filters } from '../../../data/data1d/filter1d/Filters';
import getReferenceShift from '../../../data/data1d/getReferenceShift';
import { getMissingProjection, Datum2D } from '../../../data/data2d/Datum2D';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { State } from '../Reducer';

import { setDomain, setMode } from './DomainActions';
import { setTab, setActiveTab } from './ToolsActions';

function checkIsVisible2D(datum: Datum2D): boolean {
  if (
    datum.display.isPositiveVisible === false &&
    datum.display.isNegativeVisible === false
  ) {
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

function handleChangePeaksMarkersVisibility(draft: Draft<State>, data) {
  for (let datum of draft.data) {
    if (
      datum.info?.dimension === 1 &&
      data.some((activeData) => activeData.id === datum.id)
    ) {
      (datum as Datum1D).display.isPeaksMarkersVisible = true;
    } else {
      (datum as Datum1D).display.isPeaksMarkersVisible = false;
    }
  }
}

function handleChangeActiveSpectrum(draft: Draft<State>, activeSpectrum) {
  // const state = original(draft);

  let refreshDomain = false;
  if (activeSpectrum) {
    // AnalysisObj.getDatum(activeSpectrum.id).setDisplay({ isVisible: true });
    const newIndex = draft.data.findIndex((d) => d.id === activeSpectrum.id);
    const oldIndex = draft.data.findIndex(
      (d) => d.id === draft.activeSpectrum?.id,
    );
    if (newIndex !== -1) {
      const newActiveSpectrum = draft.data[newIndex] as Datum1D | Datum2D;

      newActiveSpectrum.display.isVisible = true;

      if (oldIndex !== -1) {
        refreshDomain =
          (draft.data[oldIndex] as Datum1D | Datum2D).info.isFid ===
          newActiveSpectrum.info.isFid
            ? false
            : true;
      } else {
        refreshDomain = newActiveSpectrum.info.isFid || false;
      }
    }
    activeSpectrum = { ...activeSpectrum, index: newIndex };
    draft.activeSpectrum = activeSpectrum;
    draft.tabActiveSpectrum[draft.activeTab] = activeSpectrum;
  } else {
    draft.activeSpectrum = null;
    draft.tabActiveSpectrum[draft.activeTab] = null;
    refreshDomain = false;
  }

  /**
   * if the active spectrum not is FID then dont refresh the domain and the mode when the first time you activate soectrum
   * if the new active spectrum different than the previous active spectrum fid then refresh the domain andf the mode.
   */
  if (refreshDomain) {
    setDomain(draft);
    // const tab = draft.activeTab;
    // delete draft.tabActiveSpectrum[tab];
    setMode(draft);
  }
}

function changeSpectrumSetting(draft: Draft<State>, { id, display }) {
  const state = original(draft) as State;
  const index = state.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    draft.data[index].display = display;
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
  const { activeTab } = draft;
  const state = original(draft) as State;
  if (action.id) {
    const index = state.data.findIndex((d) => (d.id = action.id));
    draft.data.splice(index, 1);
  } else {
    draft.data.forEach((datum, index) => {
      draft.data.splice(index, 1);
    });
  }
  draft.activeSpectrum = null;
  setActiveTab(draft, activeTab, true);
}
function addMissingProjectionHander(draft, action) {
  const state = original(draft);
  const nucleus = action.nucleus;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    for (let n of nucleus) {
      const datum1D = getMissingProjection(state.data[index], n);
      draft.data.push(datum1D);
    }
    const groupByNucleus = GroupByInfoKey('nucleus');
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
        datum.info.nucleus === draft.activeTab &&
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

export {
  handleSpectrumVisibility,
  handleChangePeaksMarkersVisibility,
  handleChangeActiveSpectrum,
  handleChangeSpectrumColor,
  changeSpectrumSetting,
  handleDeleteSpectra,
  addMissingProjectionHander,
  alignSpectraHandler,
};
