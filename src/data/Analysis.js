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

  toJson(options = {}) {}
}
