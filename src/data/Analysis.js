import { convert, createTree } from 'jcampconverter';
import { Molecule } from 'openchemlib';

import { getInfoFromMetaData } from './utilities/getInfoFromMetaData';
import { Data1DManager } from './data1d/Data1DManager';
import { Data2DManager } from './data2d/Data2DManager';
import { Molecule as mol } from './molecules/Molecule';
import { MoleculeManager } from './molecules/MoleculeManager';

export class Analysis {
  constructor() {
    this.data1d = [];
    this.data2d = [];
    this.molecules = [];
    this.preferences = {
      '1d': {},
      '2d': {},
    };
  }

  static async fromJSON(json = {}) {
    const analysis = new Analysis();
    analysis.data1d = await Data1DManager.fromJSON(json.data1d);
    analysis.data2d = await Data2DManager.fromJSON(json.data2d);
    if (json.molecules)
      analysis.molecules = MoleculeManager.fromJSON(json.molecules);

    if (json.preference) analysis.preferences = json.preferences;
    return analysis;
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
    if (meta.dimension === 1) {
      this.data1d.push(Data1DManager.fromJcamp(jcamp, options));
    }
    if (meta.dimension === 2) {
      this.data2d.push(Data2DManager.fromJcamp(jcamp, options));
    }
  }

  async addMolfileFromURL(molfileURL) {
    let molfile = await fetch(molfileURL).then((response) => response.text());
    this.addMolfile(molfile);
  }

  getMolecules() {
    return this.molecules;
  }

  getPreferences(key) {
    return this.preferences[key];
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
    const data1d = this.data1d.map((ob) => {
      return {
        ...ob.toJSON(),
        data: {},
      };
    });

    const molecules = this.molecules.map((ob) => ob.toJSON());
    return { data1d, molecules, preferences: this.preferences };
  }

  set1DPreferences(preferences) {
    this.preferences = {
      ...this.preferences,
      '1d': { ...this.preferences['1d'], ...preferences },
    };
  }

  pushDatum1D(object) {
    this.data1d.push(object);
  }

  getDatum1D(id) {
    return this.data1d.find((ob) => ob.id === id);
  }

  /**
   *
   * @param {boolean} isRealData
   */
  getData1d(isRealData = true) {
    return this.data1d
      ? this.data1d.map((ob) => {
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

  deleteDatum1DByIDs(IDs) {
    const _data1d = this.data1d.filter((d) => !IDs.includes(d.id));
    this.data1d = _data1d.length > 0 ? _data1d : null;
  }
}
