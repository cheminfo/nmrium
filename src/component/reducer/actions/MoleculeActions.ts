import { Draft } from 'immer';
import { signalsToXY } from 'nmr-processing';

import {
  Datum1D,
  initiateDatum1D,
  mapRanges,
  updateIntegralRanges,
} from '../../../data/data1d/Spectrum1D';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { handleUnlinkZone } from './ZonesActions';
import { setZoom } from './Zoom';
import { getNucleusFrom2DExperiment } from '../../../data/utilities/getNucleusFrom2DExperiment';
import { Datum2D } from '../../../data/data2d/Spectrum2D';

interface predictionOptions {
  spectra: any;
  proton: {
    from: number,
    to: number,
  };
  carbon: {
    from: number,
    to: number,
  };
}

function addMoleculeHandler(draft: Draft<State>, molfile) {
  MoleculeManager.addMolfile(draft.molecules, molfile);
}

function setMoleculeHandler(draft: Draft<State>, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);
}

function deleteMoleculeHandler(draft: Draft<State>, action) {
  const { key, assignmentData } = action.payload;
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    handleUnlinkRange(draft, { payload: { assignmentData, rangeData: null } });
  }
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    handleUnlinkZone(draft, { payload: { assignmentData, zoneData: null } });
  }
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );

  draft.molecules.splice(moleculeIndex, 1);
}

function predictSpectraFromMolculeHandler(draft: Draft<State>, action) {
  const { fromMolfile, usedColors } = action.payload;
  const options = action.payload.options as predictionOptions;
  const { spectra } = options;
  const createDatum = {}
  for (const dim in spectra) {
    for (const exp in spectra[dim]) {
      const datum = createDatum[dim](fromMolfile[exp], {
        nucleus:  getNucleusFromExperiment(exp),
        usedColors,
        options: options[exp],
      });
      draft.data.push(datum);
    }
  }
  const index = draft.data.length - 1;
  const datum = draft.data[index] as Datum1D | Datum2D;
  const activeSpectrum = { id: datum.id, index };
  draft.tabActiveSpectrum['1H'] = activeSpectrum;
  draft.activeSpectrum = activeSpectrum;
  // setActiveTab(draft);
  // setZoom(draft, 0.9, id);

  draft.isLoading = false;
}

function getNucleusFromExperiment(experiment) {
  switch (experiment) {
    case 'proton':
      return '1H';
    case 'carbon':
      return '13C';
  }
}
function createDatum1D(prediction, options) {
  const { nucleus, spectrumOptions = {}, usedColors } = options;
  const { x, y } = signalsToXY(prediction.signals, spectrumOptions);
  let id: any = null;
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      info: { nucleus },
    },
    usedColors,
  );
  datum.ranges.values = mapRanges(prediction.ranges, datum);
  updateIntegralRanges(datum);

  return datum;
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMolculeHandler,
};
