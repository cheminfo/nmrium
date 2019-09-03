import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { Data1DManager } from './Data1DManager';
import { getMetaData } from './metadata/getMetaData';
import { Molecule } from 'openchemlib';

export class Analysis {
  data1d = [];
  constructor(data1d) {
    this.data1d = data1d;
    this.data2d = [];
    this.molecules = []; // chemical structures
    this.preferences = {
      display: {},
    };
  }
  // constructor(json = {}) {
  //    this.data1d = json.data1d ? Data1DManager.fromJSON(json.data1d) : [];
  //    this.data2d = [];
  //    this.molecules = []; // chemical structures
  //    this.preferences = {
  //      display: {},
  //    };
  // }

  static async build(json = {}) {
    const v_data1d = await Data1DManager.fromJSON(json.data1d);
    const data1d = json.data1d ? v_data1d : [];
    return new Analysis(data1d);
  }

  async addJcampFromURL(id, jcampURL, options) {
    let jcamp = await fetch(jcampURL).then((response) => response.text());
    this.addJcamp(id, jcamp, options);
  }

  addBruker(zipBuffer, options = {}) {}

  addJcamp(jcamp, options = {}) {
    // need to parse the jcamp
    let result = convert(jcamp, { withoutXY: true, keepRecordsRegExp: /.*/ });
    let meta = getMetaData(result.info);
    if (meta.dimension === 1) {
      this.data1d.push(Data1DManager.fromJcamp(jcamp, options));
    } else {
    }
  }

  async addMolfileFromURL(molfileURL) {
    let molfile = await fetch(molfileURL).then((response) => response.text());
    this.addMolfile(molfile);
  }

  getMolecules() {
    return this.molecules;
  }

  removeMolecule(index) {
    this.molecules.splice(index, 1);
  }

  addMolfile(molfile) {
    // try to parse molfile
    // this will throw if the molecule can not be parsed !
    let molecule = Molecule.fromMolfile(molfile);
    console.log(molecule);
    let fragments = molecule.getFragments();
    console.log(fragments);

    for (let fragment of fragments) {
      this.molecules.push({
        key: Math.random()
          .toString(36)
          .replace('0.', ''),
        molfile: fragment.toMolfileV3(),
        svg: fragment.toSVG(150, 150),
        mf: fragment.getMolecularFormula().formula,
        em: fragment.getMolecularFormula().absoluteWeight,
        mw: fragment.getMolecularFormula().relativeWeight,
      });
    }
    // we will split if we have many fragments
  }

  setMolfile(molfile, key) {
    // try to parse molfile
    // this will throw if the molecule can not be parsed !
    // console.log(index);
    let molecule = Molecule.fromMolfile(molfile);
    // console.log(molecule)
    let fragments = molecule.getFragments();
    // console.log(fragments)
    // console.log(this.molecules.filter(index, 1));

    this.molecules = this.molecules.filter((m) => m.key !== key);
     
    console.log(this.molecules);

    for (let fragment of fragments) {
      this.molecules.push({
        key: Math.random()
          .toString(36)
          .replace('0.', ''),
        molfile: fragment.toMolfileV3(),
        svg: fragment.toSVG(150, 150),
        mf: fragment.getMolecularFormula().formula,
        em: fragment.getMolecularFormula().absoluteWeight,
        mw: fragment.getMolecularFormula().relativeWeight,
      });
    }

    return this.molecules;
    // we will split if we have many fragments
  }

  /**
   *
   * @param {object} [options={}]
   * @param {boolean} [options.includeData=false]
   */

  toJSON(options = {}) {
    const data1d = this.data1d.map((ob) => {
      return { ...ob.toJSON(), data: {} };
    });
    return { data1d };
    // return {
    //   display: {}, // global display information
    //   spectra1d: [
    //     {
    //       source: {
    //         // either we have the source of we have the data
    //         jcamp: '',
    //         jcampURL: '',
    //       },
    //       data: {
    //         re: [],
    //         im: [],
    //         y: [],
    //         meta: {},
    //       },
    //       info: {},
    //       display: {},
    //     },
    //   ], // need to ask the Data1DManager
    //   spectra2d: [],
    // };
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
      ? this.data1d.map((ob, i) => {
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
            nucleus: ob.info.nucleus,
            isFid: ob.info.isFid,
            isComplex: ob.info.isComplex,
            peaks: ob.peaks,
            integrals: ob.integrals,
            filters: ob.filters,
          };
        })
      : [];
  }

  undoFilter(pastChainFilters = []) {
    // let data = { x: this.original.x, y: this.original.re };
    this.data1d.forEach((ob) => {
      ob.x = ob.source.original.x;
      ob.re = ob.source.original.re;
    });

    if (pastChainFilters && pastChainFilters.length !== 0) {
      pastChainFilters.forEach((filter) => {
        const ob = this.getDatum1D(filter.id);
        let data = { x: ob.data.x, y: ob.data.re };
        data = applyFilter({ kind: filter.kind, value: filter.value }, data);
        this.getDatum1D(filter.id).data.x = data.x;
        this.getDatum1D(filter.id).data.re = data.y;
      });

      // this.x = data.x;
      // this.re = data.y;
    }
  }

  redoFilter(nextFilter) {
    const ob = this.getDatum1D(nextFilter.id);
    let data = { x: ob.data.x, y: ob.data.re };
    data = applyFilter(
      { kind: nextFilter.kind, value: nextFilter.value },
      data,
    );
    ob.x = data.x;
    ob.re = data.y;
  }
}

Analysis.prototype.fromNMReData = function(zipBuffer) {};
