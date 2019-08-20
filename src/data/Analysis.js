import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { Data1DManager } from './Data1DManager';
import { getMetaData } from './metadata/getMetaData';

export class Analysis {
  
  constructor(json = {}) {
   
   console.log('dddddddddddddd');
    this.data1d = json.data1d ? Data1DManager.fromJSON(json.data1d) : [];
    this.data2d = [];
    this.molecules = []; // chemical structures
    this.preferences = {
      display: {},
    };
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

  addMolfile(molfile) {
    this.molecules.push({ molfile });
  }

  /**
   *
   * @param {object} [options={}]
   * @param {boolean} [options.includeData=false]
   */

  toJson(options = {}) {
    return {
      display: {}, // global display information
      spectra1d: [
        {
          source: {
            // either we have the source of we have the data
            jcamp: '',
            jcampURL: '',
          },
          data: {
            re: [],
            im: [],
            y: [],
            meta: {},
          },
          info: {},
          display: {},
        },
      ], // need to ask the Data1DManager
      spectra2d: [],
    };
  }

  saveDataToJSON() {
    const data1d = this.data1d.map((ob) => {
      return {
        data: {
          x: ob.x,
          y: ob.re,
          im: ob.im,
        },
        options: {
          display: {
            id: ob.id,
            name: ob.name,
            color: ob.color,
            isVisible: ob.isVisible,
            isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
            isRealSpectrumVisible: ob.isRealSpectrumVisible,
            peaks: ob.peaks,
            integrals: ob.integrals,
            filters: ob.filters,
          },
          info: {
            nucleus: ob.nucleus,
            isFid: ob.isFid,
            isComplex: ob.isComplex,
          },
        },
      };
    });
   try{
    const fileData = JSON.stringify({data1d});
    const blob = new Blob([fileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    console.log(link);
    link.download = 'experiment.json';
    link.href = url;
    link.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
    // console.log(link.click());
   }catch(e){
     console.log(e);
   }
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
    return this.data1d.map((ob) => {
      return {
        id: ob.id,
        x: ob.x,
        y: isRealData?ob.re:ob.im,
        im: ob.im,
        name: ob.name,
        color: ob.color,
        isVisible: ob.isVisible,
        isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
        isRealSpectrumVisible: ob.isRealSpectrumVisible,
        nucleus: ob.nucleus,
        isFid: ob.isFid,
        isComplex: ob.isComplex,
        peaks: ob.peaks,
        integrals: ob.integrals,
        filters: ob.filters,
      };
    });
  }


  undoFilter(pastChainFilters = []) {
    // let data = { x: this.original.x, y: this.original.re };
    this.data1d.forEach((ob) => {
      ob.x = ob.original.x;
      ob.re = ob.original.re;
    });

    if (pastChainFilters && pastChainFilters.length !== 0) {
      pastChainFilters.forEach((filter) => {
        const ob = this.getDatum1D(filter.id);
        let data = { x: ob.x, y: ob.re };
        data = applyFilter({ kind: filter.kind, value: filter.value }, data);
        this.getDatum1D(filter.id).x = data.x;
        this.getDatum1D(filter.id).re = data.y;
      });

      // this.x = data.x;
      // this.re = data.y;
    }
  }

  redoFilter(nextFilter) {
    const ob = this.getDatum1D(nextFilter.id);
    let data = { x: ob.x, y: ob.re };
    data = applyFilter(
      { kind: nextFilter.kind, value: nextFilter.value },
      data,
    );
    ob.x = data.x;
    ob.re = data.y;
  }

}

Analysis.prototype.fromNMReData = function(zipBuffer) {};
