import type { Info1D } from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import type { DatabaseNMREntry } from 'nmr-processing';

import {
  get1DColor,
  isSpectrum1D,
  mapRanges,
} from '../../../data/data1d/Spectrum1D/index.js';
import {
  resurrectSpectrumFromRanges,
  resurrectSpectrumFromSignals,
} from '../../../data/data1d/Spectrum1D/ranges/resurrectSpectrum.js';
import { filterDatabaseInfoEntry } from '../../utility/filterDatabaseInfoEntry.js';
import type { State } from '../Reducer.js';
import { setZoom } from '../helper/Zoom1DManager.js';
import zoomHistoryManager from '../helper/ZoomHistoryManager.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import type { ActionType } from '../types/ActionType.js';

import { setDomain } from './DomainActions.js';
import { addMolecule } from './MoleculeActions.js';
import { changeSpectrumVerticalAlignment } from './PreferencesActions.js';

interface BaseResurrectSpectrum {
  databaseEntry: DatabaseNMREntry;
  molfile?: string;
}
interface ResurrectSpectrumFromJCAMP extends BaseResurrectSpectrum {
  source: 'jcamp';
  spectrum: Spectrum1D;
}
interface ResurrectSpectrumFromRangesOrSignals extends BaseResurrectSpectrum {
  source: 'rangesOrSignals';
}

type ResurrectSpectrum =
  | ResurrectSpectrumFromJCAMP
  | ResurrectSpectrumFromRangesOrSignals;

type ResurrectSpectrumAction = ActionType<
  'RESURRECTING_SPECTRUM',
  ResurrectSpectrum
>;

export type DatabaseActions =
  | ActionType<'TOGGLE_SIMILARITY_TREE'>
  | ResurrectSpectrumAction;

function handleResurrectSpectrum(
  draft: Draft<State>,
  action: ResurrectSpectrumAction,
) {
  const {
    spectra: { activeTab: nucleus },
  } = draft.view;
  const { databaseEntry, source, molfile } = action.payload;
  const {
    ranges,
    signals,
    solvent,
    names = [],
    id: spectrumID,
  } = databaseEntry;

  let resurrectedSpectrum: Spectrum | null | undefined = null;

  if (source === 'jcamp') {
    const { spectrum } = action.payload;

    resurrectedSpectrum = {
      ...spectrum,
      id: spectrumID,
      ranges: {
        ...spectrum.ranges,
        values: mapRanges(ranges, spectrum),
      },
      display: {
        ...spectrum.display,
        ...get1DColor(spectrum.display, { usedColors: draft.usedColors }),
      },
    };
  }

  if (source === 'rangesOrSignals') {
    const activeSpectrum = getSpectrum(draft) || draft.data[0];
    let options: { from?: number; to?: number } = {};
    let info: Partial<Info1D> = { solvent, name: names[0], nucleus };

    if (isSpectrum1D(activeSpectrum)) {
      const {
        data: { x },
        info: spectrumInfo,
      } = activeSpectrum;
      options = { from: x[0], to: x.at(-1) };
      info = { ...spectrumInfo, ...info };
    }

    if (signals) {
      resurrectedSpectrum = resurrectSpectrumFromSignals(signals, {
        spectrumID,
        info,
        usedColors: draft.usedColors,
        ...options,
      });
    } else if (ranges) {
      resurrectedSpectrum = resurrectSpectrumFromRanges(ranges, {
        spectrumID,
        info,
        usedColors: draft.usedColors,
        ...options,
      });
    }
  }

  if (!resurrectedSpectrum) return;

  const filterDatabaseEntryInfo = filterDatabaseInfoEntry(databaseEntry);
  resurrectedSpectrum.customInfo = filterDatabaseEntryInfo;

  draft.data.push(resurrectedSpectrum);

  setDomain(draft, { isYDomainShared: false });
  //rescale the vertical zoom
  setZoom(draft, { scale: 0.8, spectrumID: resurrectedSpectrum.id });

  changeSpectrumVerticalAlignment(draft, { verticalAlign: 'stack' });

  //keep the last horizontal zoom
  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }

  if (molfile) {
    addMolecule(draft, { molfile, id: spectrumID });
  }
}

function handleToggleSimilarityTree(draft: Draft<State>) {
  draft.view.spectra.showSimilarityTree =
    !draft.view.spectra.showSimilarityTree;
}

export { handleResurrectSpectrum, handleToggleSimilarityTree };
