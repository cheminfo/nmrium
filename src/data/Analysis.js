import * as SpectraManager from './SpectraManager';
import CorrelationManager from './correlation/CorrelationManager';
import { toJSON } from './data1d/Datum1D';

export class Analysis {
  spectra = [];
  molecules = [];

  constructor(correlations = {}) {
    this.correlationManagerInstance = new CorrelationManager(
      correlations.options,
      correlations.values,
    );
    // this.multipleAnalysisInstance = new MultipleAnalysis(
    //   this.spectra,
    //   multipleAnalysis,
    // );
  }

  // handle zip files
  static usedColors = [];

  async fromZip(zipFiles) {
    const spectra = [];
    for (let zipFile of zipFiles) {
      await SpectraManager.addBruker(
        spectra,
        { display: { name: zipFile.name } },
        zipFile.binary,
      );
    }
    return spectra;
  }

  addJDFs(files) {
    const spectra = [];
    for (let i = 0; i < files.length; i++) {
      SpectraManager.addJDF(spectra, files[i].binary, {
        display: {
          name: files[i].name,
        },
        source: {
          jcampURL: files[i].jcampURL ? files[i].jcampURL : null,
        },
      });
    }
    return spectra;
  }

  addJcamps(files) {
    const spectra = [];
    for (let i = 0; i < files.length; i++) {
      SpectraManager.addJcamp(spectra, files[i].binary.toString(), {
        display: {
          name: files[i].name,
        },
        source: {
          jcampURL: files[i].jcampURL ? files[i].jcampURL : null,
        },
      });
    }
    return spectra;
  }

  async addMolfileFromURL(molfileURL) {
    let molfile = await fetch(molfileURL).then((response) => response.text());
    this.addMolfile(molfile);
  }

  /**
   *
   * @param {object} [options={}]
   * @param {boolean} [options.includeData=false]
   */

  toJSON() {
    const spectra = this.spectra.map((ob) => {
      return {
        ...toJSON(ob),
        data: {},
      };
    });

    const molecules = this.molecules.map((ob) => ob.toJSON());
    return {
      spectra: spectra,
      molecules,
      preferences: this.preferences,
      correlations: this.getCorrelations(),
      // multipleAnalysis: this.getMultipleAnalysis(),
    };
  }

  // getMultipleAnalysisInstance() {
  //   return this.multipleAnalysisInstance;
  // }

  // getMultipleAnalysisTableAsString(nucleus) {
  //   return this.multipleAnalysisInstance.getDataAsString(nucleus);
  // }

  getCorrelations() {
    return this.correlationManagerInstance.getData();
  }

  // getMultipleAnalysis() {
  //   return this.multipleAnalysisInstance.getData();
  // }

  getCorrelationManagerInstance() {
    return this.correlationManagerInstance;
  }
}
