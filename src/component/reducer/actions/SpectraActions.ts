import type { NMRRange } from '@zakodium/nmr-types';
import type {
  Color2D,
  Display1D,
  Display2D,
  SpectraColors,
  Spectrum1D,
  Spectrum2D,
  Spectrum,
} from '@zakodium/nmrium-core';
import type { NmrData2DFid, NmrData2DFt } from 'cheminfo-types';
import dlv from 'dlv';
import type { Draft } from 'immer';
import { original } from 'immer';
import { Filters1DManager } from 'nmr-processing';

import {
  get1DColor,
  getReferenceShift,
  initiateDatum1D,
  isSpectrum1D,
  resurrectSpectrumFromRanges,
} from '../../../data/data1d/Spectrum1D/index.js';
import type { SpectrumSimulationOptions } from '../../../data/data1d/spectrumSimulation.js';
import { simulateSpectrum } from '../../../data/data1d/spectrumSimulation.js';
import { contoursManager } from '../../../data/data2d/Spectrum2D/contours.js';
import {
  get2DColor,
  getMissingProjection,
  isSpectrum2D,
} from '../../../data/data2d/Spectrum2D/index.js';
import {
  adjustAlpha,
  generateColor,
} from '../../../data/utilities/generateColor.js';
import groupByInfoKey from '../../utility/GroupByInfoKey.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import type { State } from '../Reducer.js';
import { setZoom } from '../helper/Zoom1DManager.js';
import { getActiveSpectra } from '../helper/getActiveSpectra.js';
import { getActiveSpectraAsObject } from '../helper/getActiveSpectraAsObject.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import { removeSpectrumRelatedObjectsById } from '../helper/removeSpectrumRelatedObjectsById.js';
import type { ActionType } from '../types/ActionType.js';

import type { SetDomainOptions } from './DomainActions.js';
import { setDomain, setMode } from './DomainActions.js';
import { rollbackSpectrumByFilter } from './FiltersActions.js';
import {
  resetSelectedTool,
  setActiveTab,
  setMargin,
  setTab,
} from './ToolsActions.js';

type ChangeSpectrumVisibilityByIdAction = ActionType<
  'CHANGE_SPECTRUM_VISIBILITY',
  {
    id: string; // spectrum id
    key: 'isVisible' | 'isPositiveVisible' | 'isNegativeVisible';
  }
>;

export type SpectraSelectedMode = 'selected' | 'all' | 'selectedOnly';

type ChangeSpectraVisibilityByNucleusAction = ActionType<
  'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
  {
    nucleus: string;
    flag: boolean;
    mode?: SpectraSelectedMode;
  }
>;
type ChangeActiveSpectrumAction = ActionType<
  'CHANGE_ACTIVE_SPECTRUM',
  {
    modifier?:
      | 'shift[false]_ctrl[true]'
      | 'shift[true]_ctrl[false]'
      | 'shift[true]_ctrl[true]'
      | (string & {});

    id?: string; // spectrum id
  }
>;
type ChangeSpectrumSettingAction = ActionType<
  'CHANGE_SPECTRUM_SETTING',
  {
    id: string;
    display: Display1D | Display2D;
  }
>;
type DeleteSpectraAction = ActionType<
  'DELETE_SPECTRA',
  {
    ids?: string[];
    domainOptions?: SetDomainOptions;
  }
>;
type AddMissingProjectionAction = ActionType<
  'ADD_MISSING_PROJECTION',
  {
    nucleus: string[];
  }
>;
type AlignSpectraAction = ActionType<
  'ALIGN_SPECTRA',
  {
    from: number;
    to: number;
    nbPeaks: number;
    targetX: number;
  }
>;

type GenerateSpectrumFromPublicationStringAction = ActionType<
  'GENERATE_SPECTRUM_FROM_PUBLICATION_STRING',
  {
    ranges: NMRRange[];
    info: {
      nucleus: string;
      solvent: string;
      frequency: number;
      name: string;
    };
  }
>;
type ImportSpectraMetaInfoAction = ActionType<
  'IMPORT_SPECTRA_META_INFO',
  {
    spectraMeta: Record<string, Record<string, any>>;
  }
>;
type ReColorSpectraBasedOnDistinctValueAction = ActionType<
  'RECOLOR_SPECTRA_COLOR',
  {
    jpath?: string[];
    customColors?: SpectraColors;
  }
>;
type SimulateSpectrumAction = ActionType<
  'SIMULATE_SPECTRUM',
  {
    keepSpectrum?: boolean;
    spinSystem: string;
  } & SpectrumSimulationOptions
>;

type UpdateSpectrumMetaAction = ActionType<
  'UPDATE_SPECTRUM_META',
  {
    meta: Record<string, string>;
  }
>;

export type SpectrumActions =
  | ActionType<'TOGGLE_SPECTRA_LEGEND'>
  | ChangeSpectrumVisibilityByIdAction
  | ChangeSpectraVisibilityByNucleusAction
  | ChangeActiveSpectrumAction
  | ChangeSpectrumSettingAction
  | DeleteSpectraAction
  | AddMissingProjectionAction
  | AlignSpectraAction
  | GenerateSpectrumFromPublicationStringAction
  | ImportSpectraMetaInfoAction
  | ReColorSpectraBasedOnDistinctValueAction
  | SimulateSpectrumAction
  | UpdateSpectrumMetaAction;

function checkIsVisible2D(datum: Spectrum2D): boolean {
  if (!datum.display.isPositiveVisible && !datum.display.isNegativeVisible) {
    return false;
  }
  return true;
}

function setVisible(datum, flag) {
  if (datum.info.dimension === 2) {
    (datum as Spectrum2D).display.isPositiveVisible = flag;
    (datum as Spectrum2D).display.isNegativeVisible = flag;
    (datum as Spectrum2D).display.isVisible = checkIsVisible2D(
      datum as Spectrum2D,
    );
  } else {
    (datum as Spectrum1D).display.isVisible = flag;
  }
}

interface MultipleSelectOptions {
  spectra: Spectrum[];
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

function setSpectraMetaInfo(
  draft: Draft<State>,
  spectraMetaInfo: Record<string, Record<string, any>>,
) {
  const { data } = draft;
  for (const spectrum of data) {
    if (spectraMetaInfo[spectrum.id]) {
      spectrum.customInfo = spectraMetaInfo[spectrum.id];
    }
  }
}

//action
function handleChangeSpectrumVisibilityById(
  draft: Draft<State>,
  action: ChangeSpectrumVisibilityByIdAction,
) {
  const { id, key } = action.payload;
  const { xDomain, data } = draft;

  const spectrum = data.find((d) => d.id === id);
  if (spectrum) {
    spectrum.display[key] = !spectrum.display[key];

    if (spectrum.info.dimension === 2) {
      spectrum.display.isVisible = checkIsVisible2D(spectrum as Spectrum2D);
    }
  }

  if (xDomain?.length === 0) {
    setDomain(draft);
  }
}

//action
function handleChangeSpectraVisibilityByNucleus(
  draft: Draft<State>,
  action: ChangeSpectraVisibilityByNucleusAction,
) {
  const { nucleus, flag, mode = 'all' } = action.payload;
  const activeSpectra = getActiveSpectraAsObject(draft);
  for (const datum of getSpectraByNucleus(nucleus, draft.data)) {
    switch (mode) {
      case 'selected':
        if (activeSpectra && datum.id in activeSpectra) {
          setVisible(datum, flag);
        }
        break;
      case 'selectedOnly':
        if (activeSpectra && datum.id in activeSpectra) {
          setVisible(datum, flag);
        } else {
          setVisible(datum, !flag);
        }
        break;

      default:
        setVisible(datum, flag);
    }
  }
}

//action
function handleChangeActiveSpectrum(
  draft: Draft<State>,
  action: ChangeActiveSpectrumAction,
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
  const spectraObj: Record<string, { spectrum: Spectrum; index: number }> = {};

  for (let i = 0; i < data?.length; i++) {
    spectraObj[data[i].id] = { spectrum: data[i], index: i };
  }

  //set the index of the active spectra and make it visible
  const newActiveSpectra: any[] = [];
  for (const spectrumId of spectraIds) {
    newActiveSpectra.push({
      id: spectrumId,
      index: spectraObj[spectrumId].index,
      selected: true,
    });
  }

  if (newActiveSpectra.length > 0) {
    //set the active spectra
    activeSpectra[activeTab] = newActiveSpectra;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete activeSpectra[activeTab];
  }

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
    previousActiveSpectraHasFT === undefined ||
    (previousActiveSpectraHasFT !== newActiveSpectraHasFT &&
      spectra &&
      spectra?.length > 0 &&
      spectraIds?.length > 0);

  /**
   * if the active spectrum not is FID then do not refresh the domain and the mode when the first time you activate spectrum
   * if the new active spectrum different than the previous active spectrum fid then refresh the domain and the mode.
   */

  if (toolOptions.data.activeFilterID) {
    rollbackSpectrumByFilter(draft, {
      targetSpectrum:
        spectra?.length === 1 ? { index: spectra[0].index } : undefined,
      reset: true,
    });
  } else if (refreshDomain) {
    setDomain(draft);
    setMargin(draft);
    setMode(draft);
  }

  if (!toolOptions.data.activeFilterID) {
    resetSelectedTool(draft);
  }
}
//action
function handleChangeSpectrumSetting(
  draft: Draft<State>,
  action: ChangeSpectrumSettingAction,
) {
  const { id, display } = action.payload;
  const index = draft.data.findIndex((d) => d.id === id);
  if (index !== -1) {
    const spectrum = draft.data[index];
    spectrum.display = display;
    if (isSpectrum2D(spectrum)) {
      const { checkLevel } = contoursManager(spectrum);
      checkLevel();
    }
  }
}

//action
function handleDeleteSpectra(draft: Draft<State>, action: DeleteSpectraAction) {
  const { ids, domainOptions } = action?.payload || {};
  const activeSpectra = getActiveSpectra(draft);

  let deleteSpectraIDs: Array<{ id: string; index: number }> = [];
  if (ids) {
    const hashIDs = new Set(ids);
    for (let index = 0; index < draft.data.length; index++) {
      const { id } = draft.data[index];
      if (hashIDs.has(id)) {
        deleteSpectraIDs.push({ id, index });
        hashIDs.delete(id);

        if (hashIDs.size === 0) {
          break;
        }
      }
    }
  } else {
    deleteSpectraIDs = activeSpectra || [];
  }

  /**
   * Sort the spectraIDs indices in descending order.
   * This prevents shifting issues when removing elements, ensuring that each deletion doesn't changing the positions of remaining elements to be removed.
   */
  deleteSpectraIDs.sort((a, b) => b.index - a.index);

  for (const { index, id } of deleteSpectraIDs) {
    draft.data.splice(index, 1);
    removeSpectrumRelatedObjectsById(draft, id);
  }

  //TODO refactor the view state, https://github.com/cheminfo/nmrium/issues/3169
  //update keys preferences

  const spectraRemovedIDs = {};

  for (const { id } of deleteSpectraIDs) {
    spectraRemovedIDs[id] = true;
  }

  for (const key of Object.keys(draft.keysPreferences)) {
    const preferencesState = draft.keysPreferences[key];
    // remove related object from save preferences for deleted spectra
    for (const { id } of preferencesState.data) {
      if (spectraRemovedIDs[id]) {
        removeSpectrumRelatedObjectsById(preferencesState, id);
      }
    }
  }

  setActiveTab(draft, {
    tab: draft.view.spectra.activeTab,
    refreshActiveTab: true,
    domainOptions,
  });
}

//action
function handleAddMissingProjectionHandler(
  draft,
  action: AddMissingProjectionAction,
) {
  const state = original(draft);
  const { nucleus } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const Spectrum2D = state.data[index];
    const { info, data } = Spectrum2D;
    for (const n of nucleus) {
      const datum1D = getMissingProjection(
        info.isFid ? (data as NmrData2DFid).re : (data as NmrData2DFt).rr,
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

//action
function handleAlignSpectraHandler(
  draft: Draft<State>,
  action: AlignSpectraAction,
) {
  if (draft.data && draft.data.length > 0) {
    for (const datum of draft.data) {
      if (
        datum.info?.dimension === 1 &&
        datum.info.nucleus === draft.view.spectra.activeTab &&
        !datum.info?.isFid
      ) {
        const shift = getReferenceShift(datum, { ...action.payload });
        rollbackSpectrumByFilter(draft, {
          key: 'shiftX',
          searchBy: 'name',
          applyFilter: false,
        });
        Filters1DManager.applyFilters(datum as Spectrum1D, [
          {
            name: 'shiftX',
            value: { shift },
          },
        ]);
      }
    }
  }

  setDomain(draft);
  setMode(draft);
}

//action
function handleGenerateSpectrumFromPublicationStringHandler(
  draft: Draft<State>,
  action: GenerateSpectrumFromPublicationStringAction,
) {
  const { ranges, info } = action.payload;
  const spectrum = resurrectSpectrumFromRanges(ranges, {
    info,
    usedColors: draft.usedColors,
  });

  if (spectrum) {
    draft.data.push(spectrum);
    setActiveTab(draft);
    setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });
  }
}

//action
function handleImportSpectraMetaInfo(
  draft: Draft<State>,
  action: ImportSpectraMetaInfoAction,
) {
  const metaSpectra = action.payload.spectraMeta;
  setSpectraMetaInfo(draft, metaSpectra);
}

//action
function handleToggleSpectraLegend(draft: Draft<State>) {
  draft.view.spectra.showLegend = !draft.view.spectra.showLegend;
}

function groupSpectraByClass(spectra: Spectrum[], jpath: string | string[]) {
  const spectraByClass: Record<string, Spectrum[]> = {};
  for (const spectrum of spectra) {
    const key = String(dlv(spectrum, jpath, ''))
      .toLowerCase()
      .trim()
      .replace(/\r?\n|\r/, '');

    if (spectraByClass[key]) {
      spectraByClass[key].push(spectrum);
    } else {
      spectraByClass[key] = [spectrum];
    }
  }
  return spectraByClass;
}

//action
function handleRecolorSpectraBasedOnDistinctValue(
  draft: Draft<State>,
  action: ReColorSpectraBasedOnDistinctValueAction,
) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = draft;
  const { jpath = null, customColors } = action.payload;
  const spectraByNucleus = getSpectraByNucleus(activeTab, data);
  if (jpath) {
    //recolor spectra based on distinct value

    const spectraByClass = groupSpectraByClass(spectraByNucleus, jpath);

    const usedColors: string[] = [];
    for (const spectra of Object.values(spectraByClass)) {
      let color: string | Color2D;
      if (isSpectrum1D(spectra[0])) {
        color = spectra[0].display.color;
        if (usedColors.includes(color)) {
          color = generateColor({ usedColors });
        }
        usedColors.push(color);
      } else {
        const { positiveColor: pColor, negativeColor: nColor } =
          spectra[0].display;
        color = { positiveColor: pColor, negativeColor: nColor };

        if (usedColors.includes(pColor)) {
          const positiveColor = generateColor({
            usedColors,
          });
          const negativeColor = adjustAlpha(positiveColor, 50);
          color = { positiveColor, negativeColor };
        }
        usedColors.push(color.positiveColor);
      }

      for (const spectrum of spectra) {
        if (typeof color === 'string') {
          spectrum.display = { ...spectrum.display, color };
        } else {
          spectrum.display = { ...spectrum.display, ...color };
        }
      }
    }
  } else {
    //reset spectra colors
    const usedColors = { '1d': [], '2d': [] };
    for (const spectrum of spectraByNucleus) {
      if (isSpectrum1D(spectrum)) {
        spectrum.display.color = get1DColor(spectrum, {
          usedColors,
          regenerate: true,
          random: !customColors,
          colors: customColors?.oneDimension || [],
        }).color;
      } else {
        const { positiveColor, negativeColor } = get2DColor(spectrum, {
          usedColors,
          regenerate: true,
          random: !customColors,
          colors: customColors?.twoDimensions || [],
        });
        spectrum.display.positiveColor = positiveColor;
        spectrum.display.negativeColor = negativeColor;
      }
    }
  }
}

function handleSimulateSpectrum(
  draft: Draft<State>,
  simulateSpectrumOptions: SimulateSpectrumAction,
) {
  const {
    payload: { spinSystem, data, options, keepSpectrum = false },
  } = simulateSpectrumOptions;

  const { x, y } = simulateSpectrum(spinSystem, {
    data,
    options,
  });

  let spectrumIndex = -1;
  if (!keepSpectrum && draft.view.currentSimulatedSpectrumKey) {
    spectrumIndex = draft.data.findIndex(
      (s) => s.id === draft.view.currentSimulatedSpectrumKey,
    );
  }
  const { frequency, to, from } = options;

  const info = {
    originFrequency: frequency,
    baseFrequency: frequency,
    name: spinSystem,
  };

  if (spectrumIndex !== -1) {
    const spectrum = draft.data[spectrumIndex] as Spectrum1D;
    spectrum.data = { x, re: y };
    spectrum.info = { ...spectrum.info, ...info };
    const [x1, x2] = draft.originDomain.xDomain;
    const isInXDomain = to - from <= x2 - x1;
    setDomain(draft, { updateYDomain: false, updateXDomain: !isInXDomain });
  } else {
    const spectrum = initiateDatum1D(
      {
        data: { x, re: y },
        info: {
          isFt: true,
          nucleus: '1H',
          ...info,
        },
      },
      { usedColors: draft.usedColors },
    );
    draft.data.push(spectrum);
    draft.view.currentSimulatedSpectrumKey = spectrum.id;
    setActiveTab(draft);
  }
}
function handleUpdateSpectrumMeta(
  draft: Draft<State>,
  action: UpdateSpectrumMetaAction,
) {
  const {
    payload: { meta },
  } = action;

  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) return null;

  draft.data[activeSpectrum.index].customInfo = meta;
}

export {
  handleAddMissingProjectionHandler,
  handleAlignSpectraHandler,
  handleChangeActiveSpectrum,
  handleChangeSpectraVisibilityByNucleus,
  handleChangeSpectrumSetting,
  handleChangeSpectrumVisibilityById,
  handleDeleteSpectra,
  handleGenerateSpectrumFromPublicationStringHandler,
  handleImportSpectraMetaInfo,
  handleRecolorSpectraBasedOnDistinctValue,
  handleSimulateSpectrum,
  handleToggleSpectraLegend,
  handleUpdateSpectrumMeta,
  setSpectraMetaInfo,
};
