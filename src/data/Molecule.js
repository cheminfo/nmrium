export class Molecule {
  /**
   * @param {object} options {key,molfile,svg,mf,em,mw}
   */
  constructor(options={}) {
    this.key =
      options.key ||
      Math.random()
        .toString(36)
        .replace('0.', '');
    this.molfile = options.molfile || '';
    this.svg = options.svg || '';
    this.mf = options.mf || 0;
    this.em = options.em || 0;
    this.mw = options.mw || 0;
  }



  toJSON() {
    return {
      molfile: this.molfile,
    };
  }
}
