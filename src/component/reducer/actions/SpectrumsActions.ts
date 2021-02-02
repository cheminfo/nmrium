import { original } from 'immer';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';

import { setDomain, setMode } from './DomainActions';
import { setTab, setActiveTab } from './ToolsActions';

function setVisible(datum, flag) {
  if (datum.info.dimension === 2) {
    datum.display.isPositiveVisible = flag;
    datum.display.isNegativeVisible = flag;
  } else {
    datum.display.isVisible = flag;
  }
}

function handleSpectrumVisibility(draft, action) {
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
    draft.data[index].display[action.key] = action.value;
  }
}

function handleChangePeaksMarkersVisibility(draft, data) {
  for (let datum of draft.data) {
    if (data.some((activeData) => activeData.id === datum.id)) {
      datum.display.isPeaksMarkersVisible = true;
    } else {
      datum.display.isPeaksMarkersVisible = false;
    }
  }
}

function handleChangeActiveSpectrum(draft, activeSpectrum) {
  // const state = original(draft);

  let refreshDomain = false;
  if (activeSpectrum) {
    // AnalysisObj.getDatum(activeSpectrum.id).setDisplay({ isVisible: true });
    const newIndex = draft.data.findIndex((d) => d.id === activeSpectrum.id);
    const oldIndex = draft.data.findIndex(
      (d) => d.id === draft.activeSpectrum?.id,
    );

    if (newIndex !== -1) {
      draft.data[newIndex].display.isVisible = true;
    }
    if (oldIndex !== -1) {
      refreshDomain =
        draft.data[oldIndex].info.isFid === draft.data[newIndex].info.isFid
          ? false
          : true;
    } else {
      refreshDomain = draft.data[newIndex].info.isFid;
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
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    // delete draft.tabActiveSpectrum[tab];
    setMode(draft);
  }
}

function changeSpectrumSetting(draft, { id, display }) {
  const state = original(draft);
  const index = state.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    draft.data[index].display = display;
  }
}
function handleChangeSpectrumColor(draft, { id, color, key }) {
  const state = original(draft);
  const index = state.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    draft.data[index].display[key] = color;
  }
}

function handleDeleteSpectra(draft, action) {
  const { activeTab } = draft;
  const state = original(draft);
  if (action.id) {
    const index = state.data.findIndex((d) => (d.id = action.id));
    draft.data.splice(index, 1);
  } else {
    draft.data.foreach((datum, index) => {
      draft.data.splice(index, 1);
    });
  }
  draft.activeSpectrum = null;
  setActiveTab(draft, activeTab, true);
}
function addMissingProjectionHander(draft, action) {
  const nucleus = action.nucleus;
  if (draft.activeSpectrum?.id) {
    AnalysisObj.addMissingProjection(draft.activeSpectrum.id, nucleus);
    draft.data = AnalysisObj.getSpectraData();
    const groupByNucleus = GroupByInfoKey('nucleus');
    const dataGroupByNucleus = groupByNucleus(draft.data);
    setTab(draft, dataGroupByNucleus, draft.activeTab, true);
    setDomain(draft);
    setMode(draft);
  }
}
function alignSpectraHandler(draft, action) {
  AnalysisObj.alignSpectra(draft.activeTab, action.payload);
  draft.data = AnalysisObj.getSpectraData();
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
