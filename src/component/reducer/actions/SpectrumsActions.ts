import { Draft, original } from 'immer';
import lodashGet from 'lodash/get';

import * as Filters from '../../../data/Filters';
import { applyFilter } from '../../../data/FiltersManager';
import {
  generateSpectrumFromPublicationString,
  getReferenceShift,
  isSpectrum1D,
  get1DColor,
} from '../../../data/data1d/Spectrum1D';
import {
  getMissingProjection,
  isSpectrum2D,
  get2DColor,
} from '../../../data/data2d/Spectrum2D';
import { contoursManager } from '../../../data/data2d/Spectrum2D/contours';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { Data2DFid, Data2DFt } from '../../../data/types/data2d/Data2D';
import { options } from '../../toolbar/ToolTypes';
import groupByInfoKey from '../../utility/GroupByInfoKey';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { State } from '../Reducer';
import { setZoom } from '../helper/Zoom1DManager';
import { getActiveSpectra } from '../helper/getActiveSpectra';
import { getActiveSpectraAsObject } from '../helper/getActiveSpectraAsObject';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';

import { setDomain, setMode } from './DomainActions';
import { resetSpectrumByFilter } from './FiltersActions';
import { setTab, setActiveTab, setMargin } from './ToolsActions';

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
  const { id, key, nucleus, flag } = action.payload;
  if (nucleus) {
    const activeSpectra = getActiveSpectraAsObject(draft);
    for (const datum of getSpectraByNucleus(nucleus, draft.data)) {
      if (activeSpectra && datum.id in activeSpectra) {
        setVisible(datum, flag);
      }
    }
  } else {
    const spectrum = draft.data.find((d) => d.id === id);
    if (spectrum) {
      spectrum.display[key] = !spectrum.display[key];

      if (spectrum.info.dimension === 2) {
        spectrum.display.isVisible = checkIsVisible2D(spectrum as Datum2D);
      }
    }
  }
}

interface MultipleSelectOptions {
  spectra: (Datum1D | Datum2D)[];
  nexId: string;
  referenceId: string;
  append?: boolean;
}

function multipleSelect(
  spectraIds: Set<string>,
  options: MultipleSelectOptions,
) {
  const { spectra, nexId, referenceId, append = false } = options;
  const startIndex = spectra.findIndex((s) => s.id === referenceId);
  const endIndex = spectra.findIndex((s) => s.id === nexId);
  if (!append) {
    spectraIds.clear();
  }

  if (endIndex > startIndex) {
    for (const spectrum of spectra.slice(startIndex, endIndex + 1)) {
      spectraIds.add(spectrum.id);
    }
  } else {
    for (const spectrum of spectra.slice(endIndex, startIndex + 1)) {
      spectraIds.add(spectrum.id);
    }
  }
}

function handleChangeActiveSpectrum(
  draft: Draft<State>,
  action: { payload: { modifier: string; id: string } },
) {
  const {
    view: {
      spectra: { activeTab, selectReferences, activeSpectra },
    },
    data,
    toolOptions,
  } = draft;
  const { modifier, id } = action.payload;
  const spectra = getActiveSpectra(draft);

  //get the spectra that its nucleus match the active tab
  const spectraPerNucleus = getSpectraByNucleus(activeTab, data);

  //set of the current active spectra
  let spectraIds = spectra?.map((s) => s.id) || [];

  // select all spectra per nucleus
  if (!id) {
    spectraIds = spectraPerNucleus.map((spectrum) => spectrum.id);
  } else {
    let spectraIdsSet: Set<string> = new Set<string>(spectraIds);
    /*
     * looking for the last selected spectrum id which we set when selecting a spectrum by pressing the Mouse Left button or pressing Ctrl + Mouse Left button
     * if there is not yet selected a spectrum we use the first spectrum
     */
    const referenceId =
      selectReferences?.[activeTab] || spectraPerNucleus?.[0].id;

    /**
     * we apply the same selection behavior like what we have in the files system
     * we have four cases for the modifiers
     *  1- Mouse Left button
     *  2- Mouse Left button + Ctrl
     *  3- Mouse Left button + Shift
     *  4- Mouse Left button + Shift + Ctrl
     */

    switch (modifier) {
      case 'shift[false]_ctrl[true]':
        if (!spectraIdsSet.has(id) || spectraIdsSet.size === 0) {
          spectraIdsSet.add(id);
        } else {
          spectraIdsSet.delete(id);
        }
        selectReferences[activeTab] = id;

        break;
      case 'shift[true]_ctrl[false]':
        multipleSelect(spectraIdsSet, {
          spectra: spectraPerNucleus,
          nexId: id,
          referenceId,
        });
        break;
      case 'shift[true]_ctrl[true]':
        multipleSelect(spectraIdsSet, {
          spectra: spectraPerNucleus,
          nexId: id,
          referenceId,
          append: true,
        });
        break;

      default:
        if (spectraIdsSet.has(id) && spectra?.length === 1) {
          spectraIdsSet.clear();
        } else {
          spectraIdsSet = new Set([id]);
        }
        selectReferences[activeTab] = id;

        break;
    }

    spectraIds = Array.from(spectraIdsSet);
  }

  // convert the spectra array to an Object where the key is the spectrum id and value is the `index` and `spectrum`
  const spectraObj: Record<
    string,
    { spectrum: Datum1D | Datum2D; index: number }
  > = {};

  for (let i = 0; i < data?.length; i++) {
    spectraObj[data[i].id] = { spectrum: data[i], index: i };
  }

  //set the index of the active spectra and make it visible
  const newActiveSpectra: any[] = [];
  for (const spectrumId of spectraIds) {
    newActiveSpectra.push({
      id: spectrumId,
      index: spectraObj[spectrumId].index,
    });
  }

  //set the active spectra
  activeSpectra[activeTab] = newActiveSpectra;

  //check if the previous selected spectra contain FT
  const previousActiveSpectraHasFT = spectra?.some(
    (active) => spectraObj[active.id].spectrum.info.isFt,
  );

  //check if the nex selected spectra contain FT
  const newActiveSpectraHasFT = Array.from(spectraIds)?.some(
    (id) => spectraObj[id].spectrum.info.isFt,
  );

  /**
   * not refresh the y domain if the next and previous selected spectra have Ft or we do not have previous or next active spectra
   */
  const refreshDomain =
    previousActiveSpectraHasFT !== newActiveSpectraHasFT &&
    spectra &&
    spectra?.length > 0 &&
    spectraIds?.length > 0;

  if (options[toolOptions.selectedTool].isFilter) {
    toolOptions.selectedTool = options.zoom.id;
    toolOptions.data.baselineCorrection = { zones: [], options: {} };
    toolOptions.selectedOptionPanel = null;
    draft.tempData = null;
  }

  /**
   * if the active spectrum not is FID then dont refresh the domain and the mode when the first time you activate soectrum
   * if the new active spectrum different than the previous active spectrum fid then refresh the domain andf the mode.
   */

  if (toolOptions.data.activeFilterID) {
    resetSpectrumByFilter(draft);
  } else if (refreshDomain) {
    setDomain(draft);
    setMargin(draft);
    setMode(draft);
  }
}

function changeSpectrumSetting(draft: Draft<State>, { id, display }) {
  const index = draft.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    const spectrum = draft.data[index];
    spectrum.display = display;
    if (isSpectrum2D(spectrum)) {
      const spectra2D = draft.view.spectra2D;
      const { checkLevel } = contoursManager(
        spectrum.id,
        spectra2D,
        spectrum.display.contourOptions,
      );
      spectra2D[spectrum.id].contoursLevel = checkLevel();
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

function removeViewLinkWithSpectra(draft: Draft<State>, spectraIds: string[]) {
  const { spectra1D, spectra2D } = draft.view;

  for (const spectrumId of spectraIds) {
    if (spectrumId in spectra1D) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, unicorn/consistent-destructuring
      delete draft.view.spectra1D[spectrumId];
    }
    if (spectrumId in spectra2D) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, unicorn/consistent-destructuring
      delete draft.view.spectra2D[spectrumId];
    }
  }
}

function handleDeleteSpectra(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (action.id) {
    const index = state.data.findIndex((d) => d.id === action.id);
    draft.data.splice(index, 1);
    removeViewLinkWithSpectra(draft, [action.id]);
  } else {
    // remove spectra and it related data in the view object
    const activeSpectra = getActiveSpectraAsObject(draft);
    draft.data = draft.data.filter((spectrum) => !activeSpectra?.[spectrum.id]);

    removeViewLinkWithSpectra(draft, Object.keys(activeSpectra || {}));
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
    const datum2D = state.data[index];
    const { info, data } = datum2D;
    for (let n of nucleus) {
      const datum1D = getMissingProjection(
        info.isFid ? (data as Data2DFid).re : (data as Data2DFt).rr,
        n,
        info,
        draft.usedColors,
      );
      draft.data.push(datum1D);
    }
    const groupByNucleus = groupByInfoKey('nucleus');
    const dataGroupByNucleus = groupByNucleus(draft.data);
    setTab(draft, dataGroupByNucleus, draft.view.spectra.activeTab, true);
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
            value: { shift },
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
function importSpectraMetaInfo(draft: Draft<State>, action) {
  const { data } = draft;
  const metaSpectra = action.payload.spectraMeta;
  for (const spectrum of data) {
    if (metaSpectra[spectrum.id]) {
      spectrum.metaInfo = metaSpectra[spectrum.id];
    }
  }
}
function handleToggleSpectraLegend(draft: Draft<State>) {
  draft.view.spectra.showLegend = !draft.view.spectra.showLegend;
}

function handleRecolorSpectraBasedOnDistinctValue(draft: Draft<State>, action) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = draft;
  const { jpath = null } = action.payload;
  const spectra = getSpectraByNucleus(activeTab, data);
  if (jpath) {
    //recolor spectra based on distinct value

    const spectraByClass: Record<string, Datum1D | Datum2D> = {};
    for (const spectrum of spectra) {
      const key = String(lodashGet(spectrum, jpath, ''))
        .toLowerCase()
        .trim()
        .replace(/\r?\n|\r/, '');

      if (spectraByClass[key]) {
        if (isSpectrum1D(spectrum)) {
          spectrum.display.color = (
            spectraByClass[key] as Datum1D
          ).display.color;
        } else {
          spectrum.display.positiveColor = (
            spectraByClass[key] as Datum2D
          ).display.positiveColor;
          spectrum.display.negativeColor = (
            spectraByClass[key] as Datum2D
          ).display.negativeColor;
        }
      } else {
        spectraByClass[key] = spectrum;
      }
    }
  } else {
    //reset spectra colors
    const usedColor = { '1d': [], '2d': [] };

    for (const spectrum of spectra) {
      if (isSpectrum1D(spectrum)) {
        spectrum.display.color = get1DColor(spectrum, usedColor, true).color;
      } else {
        const { positiveColor, negativeColor } = get2DColor(
          spectrum,
          usedColor,
          true,
        );
        spectrum.display.positiveColor = positiveColor;
        spectrum.display.negativeColor = negativeColor;
      }
    }
  }
}

function handleOrderSpectra(draft: Draft<State>, action) {
  const { data } = action.payload;
  const spectraIndexes = {};
  let index = 0;
  for (const spectrum of draft.data) {
    spectraIndexes[spectrum.id] = index;
    index++;
  }
  const sortedSpectraKey = {};
  const sortedSpectra: Datum1D[] = [];

  for (const spectrum of data) {
    const spectrumId = spectrum.id;
    sortedSpectraKey[spectrumId] = true;
    sortedSpectra.push(draft.data[spectraIndexes[spectrumId]] as Datum1D);
  }

  draft.data = draft.data
    .filter((s) => !sortedSpectraKey[s.id])
    .concat(sortedSpectra);
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
  importSpectraMetaInfo,
  handleToggleSpectraLegend,
  handleRecolorSpectraBasedOnDistinctValue,
  handleOrderSpectra,
};
