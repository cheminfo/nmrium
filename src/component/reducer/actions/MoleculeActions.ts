import { Draft } from 'immer';
import { signalsToXY } from 'nmr-processing';
import { generateSpectrum2D } from 'spectrum-generator';

import {
  initiateDatum1D,
  mapRanges,
  updateIntegralRanges,
} from '../../../data/data1d/Spectrum1D';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { handleUnlinkZone } from './ZonesActions';

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

function setGenerated1DSpectrum(draft: Draft<State>, params) {
  const { spectrum, options, usedColors } = params;

  const { signals, ranges, nucleus } = spectrum;
  const { x, y } = signalsToXY(signals, {
    ...options[nucleus],
  });
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      info: { nucleus },
    },
    usedColors,
  );
  datum.ranges.values = mapRanges(ranges, datum);
  updateIntegralRanges(datum);
  draft.data.push(datum);

  draft.tabActiveSpectrum[nucleus] = {
    id: datum.id,
    index: draft.data.length - 1,
  };
}

function setGenerated2DSpectrum(draft: Draft<State>, params) {
  const { spectrum, options, usedColors } = params;
  const { signals, nucleus } = spectrum;
  const peaks = signals.reduce(
    (acc, { x, y }) => {
      acc.x.push(x.delta);
      acc.y.push(y.delta);
      acc.z.push(1);
      return acc;
    },
    { x: [], y: [], z: [] },
  );
  const xOption = options[nucleus[0]];
  const yOption = options[nucleus[1]];
  const spectrumData = generateSpectrum2D(peaks, {
    generator: {
      from: { x: xOption.from, y: yOption.from },
      to: { x: xOption.to, y: yOption.to },
      nbPoints: 256,
      peakWidthFct: () => 0.05,
    },
  });
  const datum = initiateDatum2D(
    {
      data: { ...spectrumData, noise: 0 },
      info: { nucleus },
    },
    usedColors,
  );
  draft.data.push(datum);
}

function predictSpectraFromMoleculeHandler(draft: Draft<State>, action) {
  const { data, options, usedColors } = action.payload;

  if (!data) {
    draft.isLoading = false;
  } else {
    for (const predictedDatum of data) {
      for (const key in predictedDatum) {
        if (options.spectra[key]) {
          const spectrum = predictedDatum[key];
          switch (key) {
            case 'proton':
            case 'carbon':
              setGenerated1DSpectrum(draft, {
                spectrum,
                options,
                usedColors,
              });

              break;

            case 'cosy':
            case 'hsqc':
            case 'hmbc':
              setGenerated2DSpectrum(draft, {
                spectrum,
                options,
                usedColors,
              });

              break;
            default:
              break;
          }
        }
      }
    }

    setActiveTab(draft);
    draft.isLoading = false;
  }
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMoleculeHandler,
};
