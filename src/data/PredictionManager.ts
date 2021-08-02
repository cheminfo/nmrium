import { predictProton as predictProtonSpectrum } from 'nmr-processing';
import OCL from 'openchemlib/full';

const baseURL = 'https://nmr-prediction.service.zakodium.com';

async function predictCarbon(molfile: string): Promise<any> {
  const response = await fetch(`${baseURL}/v1/predict/carbon`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ molfile }),
    method: 'POST',
  });
  return (await response.json()).data;
}

async function predictProton(molfile: string): Promise<any> {
  const molecule = OCL.Molecule.fromMolfile(molfile);
  return predictProtonSpectrum(molecule, {});
}

export default async function predictSpectrum(molfile: string, options) {
  const promises: any = [];
  if (options.spectra['1H']) {
    const promises1H = predictProton(molfile).then((result) => ({
      nucleus: '1H',
      ...result,
    }));
    promises.push(promises1H);
  }

  if (options.spectra['13C']) {
    const promises13C = predictCarbon(molfile).then((result) => ({
      nucleus: '13C',
      ...result,
    }));
    promises.push(promises13C);
  }

  return Promise.all(promises);
}
