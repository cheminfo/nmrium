import { Molecule } from 'openchemlib/full';

import * as SpectraManager from './SpectraManager';
import CorrelationManager from './correlation/CorrelationManager';
import { toJSON } from './data1d/Datum1D';
import MultipleAnalysis from './data1d/MulitpleAnalysis';
import { Molecule as mol } from './molecules/Molecule';

export class Analysis {
  spectra = [];
  molecules = [];

  constructor(correlations = {}, multipleAnalysis = {}) {
    this.correlationManagerInstance = new CorrelationManager(
      correlations.options,
      correlations.values,
    );
    this.multipleAnalysisInstance = new MultipleAnalysis(
      this.spectra,
      multipleAnalysis,
    );
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

  getMolecules() {
    return this.molecules;
  }

  getPreferences() {
    return this.preferences;
  }

  removeMolecule(key) {
    this.molecules = this.molecules.filter((molecule) => molecule.key !== key);
  }

  addMolfile(molfile) {
    // try to parse molfile
    // this will throw if the molecule can not be parsed !
    const molecules = [];
    const molecule = Molecule.fromMolfile(molfile);
    const fragments = molecule.getFragments();
    for (let fragment of fragments) {
      molecules.push(
        new mol({
          molfile: fragment.toMolfileV3(),
          svg: fragment.toSVG(150, 150),
          mf: fragment.getMolecularFormula().formula,
          em: fragment.getMolecularFormula().absoluteWeight,
          mw: fragment.getMolecularFormula().relativeWeight,
        }),
      );
    }
    return molecules;
    // we will split if we have many fragments
  }

  setMolecules(molecules) {
    this.molecules = molecules;
  }

  setMolfile(molfile, key) {
    // try to parse molfile
    // this will throw if the molecule can not be parsed !
    let molecule = Molecule.fromMolfile(molfile);
    let fragments = molecule.getFragments();

    if (fragments.length > 1) {
      this.molecules = this.molecules.filter((m) => m.key !== key);

      for (let fragment of fragments) {
        this.molecules.push(
          new mol({
            molfile: fragment.toMolfileV3(),
            svg: fragment.toSVG(150, 150),
            mf: fragment.getMolecularFormula().formula,
            em: fragment.getMolecularFormula().absoluteWeight,
            mw: fragment.getMolecularFormula().relativeWeight,
          }),
        );
      }
    } else if (fragments.length === 1) {
      const fragment = fragments[0];
      const _mol = new mol({
        molfile: fragment.toMolfileV3(),
        svg: fragment.toSVG(150, 150),
        mf: fragment.getMolecularFormula().formula,
        em: fragment.getMolecularFormula().absoluteWeight,
        mw: fragment.getMolecularFormula().relativeWeight,
        key: key,
      });
      let molIndex = this.molecules.findIndex((m) => m.key === key);
      const _molecules = this.molecules.slice();
      _molecules.splice(molIndex, 1, _mol);
      this.molecules = _molecules;
    }

    return this.molecules;
    // we will split if we have many fragments
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
      multipleAnalysis: this.getMultipleAnalysis(),
    };
  }

  getMultipleAnalysisInstance() {
    return this.multipleAnalysisInstance;
  }

  getMultipleAnalysisTableAsString(nucleus) {
    return this.multipleAnalysisInstance.getDataAsString(nucleus);
  }

  getCorrelations() {
    return this.correlationManagerInstance.getData();
  }

  getMultipleAnalysis() {
    return this.multipleAnalysisInstance.getData();
  }

  getCorrelationManagerInstance() {
    return this.correlationManagerInstance;
  }
}
