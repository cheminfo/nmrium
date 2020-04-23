import * as JSZip from 'jszip';
import { Molecule } from 'openchemlib';

import getColor from '../component/utility/ColorGenerator';

import * as SpectraManager from './SpectraManager';
import { Datum1D } from './data1d/Datum1D';
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
      const BINARY = 1;
      const TEXT = 2;

    for (let zipFile of zipFiles) {

      let files = {
        ser: BINARY,
        fid: BINARY,
        acqus: TEXT,
        acqu2s: TEXT,
        procs: TEXT,
        proc2s: TEXT,
        '1r': BINARY,
        '1i': BINARY,
        '2rr': BINARY,
      };

      const zip = await jsZip.loadAsync(zipFile.binary);

      let folders = zip.filter( (path) => path.match( /(ser|fid|1r|2rr|__MACOSX)$/ ));
      
      let spectra = new Array(folders.length);
      for (let i = 0; i < folders.length; ++i) {
        let promises = [];
        let name = folders[i].name;
        name = name.substr(0, name.lastIndexOf('/') + 1);
        promises.push(name);
        let currFolder = zip.folder(name);
        let currFiles = currFolder.filter(function(relativePath) {
          return files[relativePath] ? true : false;
        });
        if (name.indexOf('pdata') >= 0) {
          promises.push('acqus');
          promises.push(
            zip.file(name.replace(/pdata\/[0-9]+\//, 'acqus')).async('string'),
          );
        }
        for (let j = 0; j < currFiles.length; ++j) {
          let idx = currFiles[j].name.lastIndexOf('/');
          name = currFiles[j].name.substr(idx + 1);
          promises.push(name);
          if (files[name] === BINARY) {
            promises.push(currFiles[j].async('arraybuffer'));
          } else {
            promises.push(currFiles[j].async('string'));
          }
        }
        spectra[i] = Promise.all(promises).then((result) => {
          let brukerFiles = {};
          for (let k = 1; k < result.length; k += 2) {
            name = result[k];
            brukerFiles[name] = result[k + 1];
          }
          const color = getColor(true);
          SpectraManager.addBruker(this.spectra, color, brukerFiles);
        });
      }
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
          const data =
            ob instanceof Datum1D ? { ...ob.data, y: ob.data.re } : ob.data;
          return {
            id: ob.id,
            // x: ob.data.x,
            // y: ob.data.re,
            // im: ob.data.im,
            ...data,
            display: ob.display,
            //  name: ob.display.name,
            // color: ob.display.color,
            // isVisible: ob.display.isVisible,
            // isPeaksMarkersVisible: ob.display.isPeaksMarkersVisible,
            // isRealSpectrumVisible: ob.display.isRealSpectrumVisible,
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
