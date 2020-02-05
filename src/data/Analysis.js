import { convert, createTree } from 'jcampconverter';
import { Molecule } from 'openchemlib';

import { getInfoFromMetaData } from './utilities/getInfoFromMetaData';
import { Data1DManager } from './data1d/Data1DManager';
import { Data2DManager } from './data2d/Data2DManager';
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
    const spectraData = await Data1DManager.fromJSON(json.spectra);
    const spectra = json.spectra ? spectraData : [];
    const molecules = json.molecules
      ? MoleculeManager.fromJSON(json.molecules)
      : [];
    return new Analysis(spectra, molecules, json.preferences);
  }

  async addJcampFromURL(id, jcampURL, options) {
    let jcamp = await fetch(jcampURL).then((response) => response.text());
    this.addJcamp(id, jcamp, options);
  }

  addJcamp(jcamp, options = {}) {
    // need to parse the jcamp

    let tree = createTree(jcamp);
    if (tree.length === 0) return;
    // Should be improved when we have a more complex case
    console.log(tree.length)
    let current = tree[0];
    if (current.jcamp) {
      this.addJcampSS(current.jcamp, options);
    }
    if (current.children) {
      for (let child of current.children) {
        if (child.jcamp) {
          this.addJcampSS(child.jcamp, options);
        }
      }
    }
  }

  addJcampSS(jcamp, options) {
    let result = convert(jcamp, { withoutXY: true, keepRecordsRegExp: /.*/ });
    let meta = getInfoFromMetaData(result.info);
    console.log(meta)
    if (meta.dimension === 1) {
      this.spectra.push(Data1DManager.fromJcamp(jcamp, options));
    }
    // if (meta.dimension === 2) {
    //   this.spectra.push(Data2DManager.fromJcamp(jcamp, options));
    // }
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
  getSpectraData(isRealData = true) {
    return this.spectra
      ? this.spectra.map((ob) => {
          return {
            id: ob.id,
            x: ob.data.x,
            y: isRealData ? ob.data.re : ob.data.im,
            im: ob.data.im,
            name: ob.display.name,
            color: ob.display.color,
            isVisible: ob.display.isVisible,
            isPeaksMarkersVisible: ob.display.isPeaksMarkersVisible,
            isRealSpectrumVisible: ob.display.isRealSpectrumVisible,
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
    this.spectra = _spectra.length > 0 ? _spectra : null;
  }
}
