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
    this.count = options.count || 1;
    this.attachment = options.attachment || {};
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

  getCount() {
    return this.count;
  }

  setCount(count) {
    this.count = count;
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

  getAttachments() {
    return this.attachment;
  }
}
