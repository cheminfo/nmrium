/* eslint-disable default-param-last */
import lodash from 'lodash';
import { Molecule } from 'openchemlib/full';

import * as SpectraManager from './SpectraManager';
import CorrelationManager from './correlation/CorrelationManager';
import { Datum1D } from './data1d/Datum1D';
import MultipleAnalysis from './data1d/MulitpleAnalysis';
import { Molecule as mol } from './molecules/Molecule';
import { MoleculeManager } from './molecules/MoleculeManager';

export class Analysis {
  spectra = [];
  molecules = [];

  constructor(
    spectra = [],
    molecules = [],
    preferences,
    correlations = {},
    multipleAnalysis = {},
  ) {
    this.spectra = spectra.slice();
    this.molecules = molecules.slice(); // chemical structures
    this.preferences = preferences || {};
    this.correlationManagerInstance = new CorrelationManager(
      correlations.options,
      correlations.values,
    );
    this.multipleAnalysisInstance = new MultipleAnalysis(
      this.spectra,
      multipleAnalysis,
    );
  }

  static async build(json = {}) {
    const {
      molecules: loadedMolecules,
      preferences,
      correlations,
      multipleAnalysis,
    } = json || {
      molecules: [],
      preferences: {},
      correlations: {},
      multipleAnalysis: {},
    };

    const molecules = loadedMolecules
      ? MoleculeManager.fromJSON(loadedMolecules)
      : [];

    const analysis = new Analysis(
      [],
      molecules,
      preferences,
      correlations,
      multipleAnalysis,
    );
    await SpectraManager.fromJSON(analysis.spectra, json.spectra);
    return analysis;
  }
  // handle zip files
  static usedColors = [];

  async fromZip(zipFiles) {
    for (let zipFile of zipFiles) {
      await SpectraManager.addBruker(
        this.spectra,
        { display: { name: zipFile.name } },
        zipFile.binary,
      );
    }
  }

  async addJcampFromURL(jcampURL, options) {
    SpectraManager.addJcampFromURL(this.spectra, jcampURL, options);
  }

  addJcamps(files) {
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      SpectraManager.addJcamp(this.spectra, files[i].binary.toString(), {
        display: {
          name: files[i].name,
        },
        source: {
          jcampURL: files[i].jcampURL ? files[i].jcampURL : null,
        },
      });
    }
  }
  addJcamp(jcamp, options = {}) {
    SpectraManager.addJcamp(this.spectra, jcamp, options);
  }

  addJDF(jdf, options = {}) {
    SpectraManager.addJDF(this.spectra, jdf, options);
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
    let molecule = Molecule.fromMolfile(molfile);
    let fragments = molecule.getFragments();
    this.molecules = Object.assign([], this.molecules);
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
        ...ob.toJSON(),
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

  setPreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }

  pushDatum(object) {
    this.spectra.push(object);
  }

  createSlice(id2d, position = { x: 0, y: 0 }) {
    const spectrum2d = this.getDatum(id2d);
    if (!spectrum2d) return;

    return spectrum2d.getSlice(position);
  }

  addMissingProjection(id2d, nucleus = []) {
    const spectrum2d = this.getDatum(id2d);

    for (let n of nucleus) {
      const datum1D = spectrum2d.getMissingProjection(n);
      this.spectra.push(datum1D);
    }
  }

  getDatum(id) {
    return this.spectra.find((ob) => ob.id === id);
  }

  /**
   *
   * @param {boolean} isRealData
   */
  getSpectraData() {
    return this.spectra
      ? lodash.cloneDeep(
          this.spectra.map((ob) => {
            const _data =
              ob instanceof Datum1D ? { ...ob.data, y: ob.data.re } : ob.data;
            // eslint-disable-next-line no-unused-vars
            const { data, ...rest } = ob;
            return {
              ...rest,
              ..._data,
              isVisibleInDomain: ob.display.isVisibleInDomain,
            };
          }),
        )
      : [];
  }

  alignSpectra(nucleus, { from, to, nbPeaks }) {
    const spectra = this.spectra.filter(
      (spectrum) =>
        spectrum instanceof Datum1D && spectrum.info.nucleus === nucleus,
    );
    if (spectra && spectra.length > 0) {
      const peaks = spectra.map((spectrum) => {
        const { x } = spectrum.lookupPeak(from, to);
        return x ? x : 0;
      }, []);
      const peaksSum = peaks.reduce((acc, val) => {
        return acc + val;
      }, 0);
      const targetX = peaksSum / peaks.length;
      spectra.forEach((spectrum) => {
        spectrum.alignX(spectrum, { targetX, from, to, nbPeaks });
      });
    }
  }

  deleteDatumByIDs(IDs) {
    const _spectra = this.spectra.filter((d) => !IDs.includes(d.id));
    this.spectra = _spectra.length > 0 ? _spectra : [];
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
