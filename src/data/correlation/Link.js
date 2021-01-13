import generateID from '../utilities/generateID';

export default class Link {
  constructor(options = {}) {
    this.experimentType = options.experimentType;
    this.experimentID = options.experimentID;
    this.atomType = options.atomType || [];
    this.signal = options.signal;
    this.axis = options.axis;
    this.match = options.match || [];
    this.id = options.id || generateID();
    this.experimentLabel = options.experimentLabel || '';
    this.pseudo = options.pseudo || false;
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
    if (this.getSignal()) {
      return this.getSignal().id;
    }
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

  getID() {
    return this.id;
  }

  setExperimentLabel(label) {
    this.experimentLabel = label;
  }

  getExperimentLabel() {
    return this.experimentLabel;
  }

  getPseudo() {
    return this.pseudo;
  }

  setPseudo(pseudo) {
    this.pseudo = pseudo;
  }
}
