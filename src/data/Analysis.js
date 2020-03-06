import { Molecule } from 'openchemlib';
import * as JSZip from 'jszip';

import getColor from '../component/utility/ColorGenerator';

import * as SpectraManager from './SpectraManager';
import { Molecule as mol } from './molecules/Molecule';
import { MoleculeManager } from './molecules/MoleculeManager';

export class Analysis {
  spectra = [];
  molecules = [];
  constructor(spectra = [], molecules = [], preferences) {
    this.spectra = spectra.slice();
    this.molecules = molecules.slice(); // chemical structures
    this.preferences = preferences || {};
  }

  static async build(json = {}) {
    const molecules = json.molecules
      ? MoleculeManager.fromJSON(json.molecules)
      : [];
    const analysis = new Analysis([], molecules, json.preferences);
    await SpectraManager.fromJSON(analysis.spectra, json.spectra);
    return analysis;
  }
  // handle zip files
  static usedColors = [];

  async fromZip(zipFiles) {
    // eslint-disable-next-line no-console
    const jsZip = new JSZip();

    for (let zipFile of zipFiles) {
      const zip = await jsZip.loadAsync(zipFile.binary);

      let files = Object.keys(zip.files).filter((name) =>
        name.endsWith('1/1r'),
      );
      // console.log(this.spectra);
      // eslint-disable-next-line no-await-in-loop
      files = await Promise.all(
        files.map(async (file) => {
          const color = getColor(true);
          const nameProcs = file.replace(/1r$/, 'procs');
          const nameAcqus = file.replace(/pdata\/1\/1r$/, 'acqus');
          const procs = await zip.file(nameProcs).async('text');
          const acqus = await zip.file(nameAcqus).async('text');
          const content = await zip.file(file).async('arraybuffer');

          SpectraManager.addBruker(this.spectra, color, {
            procs,
            acqus,
            content,
          });
        }),
      );
    }
  }

  async addJcampFromURL(jcampURL, options) {
    SpectraManager.addJcampFromURL(this.spectra, jcampURL, options);
  }

  addJcamp(jcamp, options = {}) {
    SpectraManager.addJcamp(this.spectra, jcamp, options);
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
    return { spectra: spectra, molecules, preferences: this.preferences };
  }

  setPreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }

  pushDatum(object) {
    this.spectra.push(object);
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
      ? this.spectra.map((ob) => {
          return {
            id: ob.id,
            x: ob.data.x,
            y: ob.data.re,
            im: ob.data.im,
            name: ob.display.name,
            color: ob.display.color,
            isVisible: ob.display.isVisible,
            isPeaksMarkersVisible: ob.display.isPeaksMarkersVisible,
            isRealSpectrumVisible: ob.display.isRealSpectrumVisible,
            isVisibleInDomain: ob.display.isVisibleInDomain,
            info: ob.info,
            meta: ob.meta,
            peaks: ob.peaks,
            integrals: ob.integrals,
            filters: ob.filters,
          };
        })
      : [];
  }

  deleteDatumByIDs(IDs) {
    const _spectra = this.spectra.filter((d) => !IDs.includes(d.id));
    this.spectra = _spectra.length > 0 ? _spectra : [];
  }
}
