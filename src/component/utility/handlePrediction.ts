import {
  predictCOSY,
  predictHMBC,
  predictHSQC,
  predictProton,
  predictCarbon,
  predictAll,
} from 'nmr-processing';
import OCL from 'openchemlib/full';

const predictor = {
  proton: predictProton,
  carbon: predictCarbon,
  cosy: predictCOSY,
  hmbc: predictHMBC,
  hsqc: predictHSQC,
};

export async function handlePrediction(action) {
  const { mol, options } = action;
  const { spectra } = options;
  const molecule = OCL.Molecule.fromMolfile(mol.molfile);

  const nbTwoD = howManySpectra(spectra['2d']);

  if (nbTwoD > 1) {
    let prediction = await predictAll(molecule);
    return filterPrediction(prediction, spectra);
  }
  let storage = {};
  if (nbTwoD > 0) {
    storage = await predictThose(molecule, spectra['2d'], storage);
  }

  storage = predictThose(molecule, spectra['1d'], storage);

  return filterPrediction(storage, spectra);
}

async function predictThose(molecule, spectra, storage) {
  for (const exp in spectra) {
    if (storage[exp]) continue;
    if (!predictor[`${exp}`]) {
      throw new Error(`predictor for ${exp} does not exist`);
    }
    storage[exp] = await predictor[`${exp}`](molecule);
  }
  return storage;
}

function filterPrediction(prediction, spectra) {
  for (const dim in spectra) {
    for (const exp in spectra[dim]) {
      if (!spectra[dim][exp] && prediction[exp]) delete prediction[exp];
    }
  }
  return prediction;
}

function howManySpectra(spectra) {
  let counter = 0;
  for (const key in spectra) {
    if (spectra[key]) counter++;
  }
  return counter;
}
