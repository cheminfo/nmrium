import { convert } from 'jcampconverter';

import { Data1DManager } from './Data1DManager';
import { getMetaData } from './metadata/getMetaData';

export class Analysis {
  constructor(json = {}) {
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
}

Analysis.prototype.fromNMReData = function(zipBuffer) {};
