export default class Link {
  constructor(options = {}) {
    this.experimentType = options.experimentType;
    this.experimentID = options.experimentID;
    this.atomType = options.atomType || [];
    this.signalID = options.signalID;
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

  getSignalID() {
    return this.signalID;
  }
  getAxis() {
    return this.axis;
  }

  addMatch(index) {
    if (!this.match.includes(index)) {
      this.match.push(index);
    }
  }

  getMatches() {
    return this.match;
  }
}
