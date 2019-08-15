export class Analysis {
  constructor(json) {
    this.data1d = [];
    this.data2d = [];
    this.molfiles = []; // chemical structures
    this.preferences = {
      display: {},
    };
  }

  addJcamp() {}

  addMolfile() {}

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
