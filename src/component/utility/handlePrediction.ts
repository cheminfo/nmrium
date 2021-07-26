import * as nmrProcessing from 'nmr-processing';
import OCL from 'openchemlib/full';


export async function handlePrediction(action) {
  const { mol, options } = action;
  const { spectra } = options;
  const molecule = OCL.Molecule.fromMolfile(mol.molfile);

  const nbTwoD = howManySpectra(spectra['2d']);

  if (nbTwoD > 1) {
    let prediction = await nmrProcessing.predictAll(molecule);
    return filterPrediction(prediction, spectra);
  }
  let storage = {};
  if (nbTwoD > 0) {
    storage = await predictThose(spectra['2d'], storage);
  }

  storage = predictThose(spectra, storage);

  return filterPrediction(storage, spectra);
}

async function predictThose(spectra, storage) {
  for (const exp in spectra) {
    if (storage[exp]) continue;
      if (!nmrProcessing[`predict${exp.toUpperCase()}`]) {
        throw new Error(`predictor for ${exp} does not exist`);
      }
      let prediction = await nmrProcessing[`predict${exp.toUpperCase()}`];
      storage = { ...storage, ...prediction };
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
