import generateID from '../utilities/generateID';

import Link from './Link';

export default class Correlation {
  constructor(options = {}) {
    this.id = options.id || generateID();
    this.experimentType = options.experimentType;
    this.experimentID = options.experimentID;
    this.atomType = options.atomType;
    this.label = options.label || {};
    this.signal = options.signal || {};
    this.link = options.link
      ? options.link.map((link) => new Link({ ...link }))
      : [];
    this.equivalence = options.equivalence || 0;
    this.attachment = options.attachment || {};
    this.protonsCount = options.protonsCount;
    this.hybridization = options.hybridization;
    this.pseudo = options.pseudo || false;
    this.edited = options.edited || {};
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

  getLabel(labelKey) {
    return this.label[labelKey];
  }

  getLabels() {
    return this.label;
  }

  setLabel(labelKey, label) {
    this.label[labelKey] = label;
  }

  getSignal() {
    return this.signal;
  }

  getEquivalences() {
    return this.equivalence;
  }

  setEquivalences(equivalence) {
    this.equivalence = equivalence;
  }

  getID() {
    return this.id;
  }

  addLink(link) {
    this.link.push(link);
  }

  getLinks() {
    return this.link;
  }

  hasAttachmentAtomType(atomType) {
    return this.attachment[atomType] ? true : false;
  }

  addAttachmentAtomType(atomType) {
    if (!this.hasAttachmentAtomType(atomType)) {
      this.attachment[atomType] = [];
    }
  }

  setAttachments(atomType, attachment) {
    this.addAttachmentAtomType(atomType);
    this.attachment[atomType] = attachment;
  }

  addAttachment(atomType, attachment) {
    this.addAttachmentAtomType(atomType);
    if (!this.attachment[atomType].includes(attachment)) {
      this.attachment[atomType].push(attachment);
    }
  }

  removeAttachment(atomType, attachment) {
    if (this.hasAttachmentAtomType(atomType)) {
      const indexOf = this.attachment[atomType].indexOf(attachment);
      if (indexOf >= 0) {
        this.attachment[atomType].splice(indexOf, 1);
      }
    }
  }

  removeAttachments() {
    this.attachment = {};
  }

  getAttachments() {
    return this.attachment;
  }

  getProtonsCount() {
    return this.protonsCount;
  }

  setProtonsCount(protonsCount) {
    this.protonsCount = protonsCount;
  }

  getHybridization() {
    return this.hybridization;
  }

  setHybridization(hybridization) {
    this.hybridization = hybridization;
  }

  getPseudo() {
    return this.pseudo;
  }

  setPseudo(pseudo) {
    this.pseudo = pseudo;
  }

  getEdited() {
    return this.edited;
  }

  setEdited(edited) {
    this.edited = edited;
  }
}
