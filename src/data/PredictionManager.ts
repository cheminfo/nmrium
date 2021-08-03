import { predictProton, predictAll } from 'nmr-processing';
import OCL from 'openchemlib/full';

const baseURL = 'https://nmr-prediction.service.zakodium.com';

async function predictCarbon(molecule: OCL.Molecule): Promise<any> {
  return predictAll(molecule, {
    predictOptions: {
      C: {
        webserviceURL: `${baseURL}/v1/predict/carbon`,
      },
    },
  });
}

export default async function predictSpectra(molfile: string, options) {
  const molecule = OCL.Molecule.fromMolfile(molfile);

  const promises: any = [predictCarbon(molecule)];

  if (options.spectra.proton) {
    const promisesProton = predictProton(molecule, {}).then((result) => ({
      proton: result,
    }));
    promises.push(promisesProton);
  }

  return Promise.all(promises);
}
