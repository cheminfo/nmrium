export default class Link {
  constructor(options = {}) {
    this.experimentType = options.experimentType;
    this.experimentID = options.experimentID;
    this.atomType = options.atomType || [];
    this.signal = options.signal;
    this.axis = options.axis;
    this.match = options.match || [];
  }

  getExperimentType() {
    return this.experimentType;
  }

  getExperimentID() {
    return this.experimentID;
  }

  getAtomType() {
    return this.atomType;
  }

  getSignal() {
    return this.signal;
  }

  getSignalID() {
    return this.getSignal().id;
  }
  getAxis() {
    return this.axis;
  }

  addMatch(index) {
    if (!this.match.includes(index)) {
      this.match.push(index);
    }
  }

  removeMatch(index) {
    const indexOf = this.match.indexOf(index);
    if (indexOf >= 0) {
      this.match.splice(indexOf, 1);
    }
  }

  removeMatches() {
    this.match = [];
  }

  getMatches() {
    return this.match;
  }
}
