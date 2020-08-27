import { produce } from 'immer';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';

import { setDomain, setMode } from './DomainActions';
import { setTab } from './ToolsActions';

function setVisible(datum, flag) {
  if (datum.info.dimension === 2) {
    datum.display.isPositiveVisible = flag;
    datum.display.isNegativeVisible = flag;
  } else {
    datum.display.isVisible = flag;
  }
}

const handleSpectrumVisibility = (state, action) => {
  return produce(state, (draft) => {
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
  });
};

const handleChangePeaksMarkersVisibility = (state, data) => {
  return produce(state, (draft) => {
    for (let datum of draft.data) {
      const datusmObject = AnalysisObj.getDatum(datum.id);
      if (data.some((activeData) => activeData.id === datum.id)) {
        datusmObject.setDisplay({ isPeaksMarkersVisible: true });
        datum.display.isPeaksMarkersVisible = true;
      } else {
        datusmObject.setDisplay({ isPeaksMarkersVisible: false });
        datum.display.isPeaksMarkersVisible = false;
      }
    }
  });
};

const handleChangeActiveSpectrum = (state, activeSpectrum) => {
  return produce(state, (draft) => {
    let refreshDomain = false;
    if (activeSpectrum) {
      AnalysisObj.getDatum(activeSpectrum.id).setDisplay({ isVisible: true });
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
      // }
    } else {
      draft.activeSpectrum = null;
      draft.tabActiveSpectrum[draft.activeTab] = null;
      refreshDomain = false;
    }

    /**
     * if the active spectrum not is FID then dont refresh the domain and the mode when the first time you activate soectrum
     * if the new active spectrum different than the previous active spectrum fid then refresh the domain andf the mode.
     */
    //
    if (refreshDomain) {
      setDomain(draft);
      delete draft.tabActiveSpectrum[draft.activeTab];
      setMode(draft);
    }
  });
};

const handleChangeSpectrumColor = (state, { id, color, key }) => {
  return produce(state, (draft) => {
    const index = draft.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      draft.data[index].display[key] = color;
      AnalysisObj.getDatum(id).setDisplay({ [key]: color });
    }
  });
};

const handleDeleteSpectra = (state, action) => {
  return produce(state, (draft) => {
    const { activeSpectrum } = draft;
    if (activeSpectrum && activeSpectrum.id) {
      AnalysisObj.deleteDatumByIDs([activeSpectrum.id]);
      draft.activeSpectrum = null;
      draft.data = AnalysisObj.getSpectraData();
      setDomain(draft);
      setMode(draft);
    } else {
      const { IDs } = action;
      AnalysisObj.deleteDatumByIDs(IDs);
      draft.data = AnalysisObj.getSpectraData();
    }
  });
};
const addMissingProjectionHander = (state, action) => {
  return produce(state, (draft) => {
    const nucleus = action.nucleus;
    if (state.activeSpectrum && state.activeSpectrum.id) {
      AnalysisObj.addMissingProjection(state.activeSpectrum.id, nucleus);
      draft.data = AnalysisObj.getSpectraData();
      const groupByNucleus = GroupByInfoKey('nucleus');
      const dataGroupByNucleus = groupByNucleus(draft.data);
      setTab(draft, dataGroupByNucleus, draft.activeTab, true);
      // setMargin(draft);
      setDomain(draft);
      setMode(draft);
    }
  });
};
export {
  handleSpectrumVisibility,
  handleChangePeaksMarkersVisibility,
  handleChangeActiveSpectrum,
  handleChangeSpectrumColor,
  handleDeleteSpectra,
  addMissingProjectionHander,
};
