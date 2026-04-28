import type { Info1D } from '@zakodium/nmr-types';
import type { Spectrum } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import type { DatabaseNMREntry } from 'nmr-processing';

import {
  initiateDatum1D,
  isSpectrum1D,
  mapRanges,
  updateRangesRelativeValues,
} from '../../../data/data1d/Spectrum1D/index.js';
import {
  resurrectSpectrumFromRanges,
  resurrectSpectrumFromSignals,
} from '../../../data/data1d/Spectrum1D/ranges/resurrectSpectrum.js';
import { initializeContoursLevels } from '../../../data/data2d/Spectrum2D/contours.ts';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D/initiateDatum2D.ts';
import { filterDatabaseInfoEntry } from '../../utility/filterDatabaseInfoEntry.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.ts';
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
  spectra: Spectrum[];
}

type ResurrectSpectrumFromRangesOrSignalsAction = ActionType<
  'RESURRECTING_SPECTRUM_FROM_SIGNALS_OR_RANGES',
  BaseResurrectSpectrum
>;
type ResurrectSpectrumFromJCAMPAction = ActionType<
  'RESURRECTING_SPECTRUM_FROM_JCAMP',
  ResurrectSpectrumFromJCAMP
>;

export type DatabaseActions =
  | ActionType<'TOGGLE_SIMILARITY_TREE'>
  | ResurrectSpectrumFromRangesOrSignalsAction
  | ResurrectSpectrumFromJCAMPAction;

function updateDomain(draft: Draft<State>) {
  setDomain(draft, { isYDomainShared: false });
  changeSpectrumVerticalAlignment(draft, { verticalAlign: 'stack' });

  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
}

function handleResurrectSpectrumFromJCAMP(
  draft: Draft<State>,
  action: ResurrectSpectrumFromJCAMPAction,
) {
  const { databaseEntry, spectra, molfile } = action.payload;
  const { ranges, id: spectrumID, nucleus } = databaseEntry;

  if (spectra.length === 0) return;

  const containOneSpectrum = spectra.length === 1;
  const spectra1D = [];

  if (molfile) {
    addMolecule(draft, { molfile, id: spectra[0].id });
  }

  for (const spectrum of spectra) {
    const filterDatabaseEntryInfo = filterDatabaseInfoEntry(databaseEntry);
    if (isSpectrum1D(spectrum)) {
      const spectrum1D = initiateDatum1D(spectrum, {
        usedColors: draft.usedColors,
      });

      if (spectrum.info.nucleus === nucleus) {
        spectrum1D.ranges.values = mapRanges(ranges, spectrum);
        updateRangesRelativeValues(spectrum1D);
      }
      spectrum1D.info.spectrumSource = 'database';
      if (containOneSpectrum) {
        spectrum1D.id = spectrumID;
      }

      draft.data.push(spectrum1D);
      spectra1D.push(spectrum1D);
    } else {
      const spectrum2d = initiateDatum2D(spectrum, {
        usedColors: draft.usedColors,
      });
      spectrum2d.info.spectrumSource = 'database';
      spectrum2d.customInfo = filterDatabaseEntryInfo;
      draft.view.spectraContourLevels[spectrum2d.id] =
        initializeContoursLevels(spectrum2d);
      draft.data.push(spectrum2d);
    }
  }

  updateDomain(draft);

  const active1DSpectra = getSpectraByNucleus(
    draft.view.spectra.activeTab,
    spectra1D,
  );

  for (const spectrum of active1DSpectra) {
    setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });
  }
}

function handleResurrectSpectrumFromRangesOrSignals(
  draft: Draft<State>,
  action: ResurrectSpectrumFromRangesOrSignalsAction,
) {
  const {
    spectra: { activeTab: nucleus },
  } = draft.view;
  const { databaseEntry, molfile } = action.payload;
  const {
    ranges,
    signals,
    solvent,
    names = [],
    id: spectrumID,
  } = databaseEntry;

  let options: { from?: number; to?: number } = {};
  let info: Partial<Info1D> = {
    solvent,
    name: names[0],
    nucleus,
    spectrumSource: 'database',
  };

  const activeSpectrum = getSpectrum(draft) || draft.data[0];
  if (isSpectrum1D(activeSpectrum)) {
    const {
      data: { x },
      info: spectrumInfo,
    } = activeSpectrum;
    options = { from: x[0], to: x.at(-1) };
    info = { ...spectrumInfo, ...info };
  }

  let resurrectedSpectrum: Spectrum | null | undefined = null;

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

  if (!resurrectedSpectrum) return;

  const filterDatabaseEntryInfo = filterDatabaseInfoEntry(databaseEntry);
  resurrectedSpectrum.customInfo = filterDatabaseEntryInfo;
  draft.data.push(resurrectedSpectrum);

  updateDomain(draft);

  setZoom(draft, { scale: 0.8, spectrumID: resurrectedSpectrum.id });

  if (molfile) {
    addMolecule(draft, { molfile, id: resurrectedSpectrum.id });
  }
}

function handleToggleSimilarityTree(draft: Draft<State>) {
  draft.view.spectra.showSimilarityTree =
    !draft.view.spectra.showSimilarityTree;
}

export {
  handleResurrectSpectrumFromJCAMP,
  handleResurrectSpectrumFromRangesOrSignals,
  handleToggleSimilarityTree,
};
