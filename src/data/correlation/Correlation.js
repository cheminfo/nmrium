import lodash from 'lodash';

import generateID from '../utilities/generateID';

export default class Correlation {
  constructor(options = {}) {
    this.id = options.id || generateID();
    this.experimentType = options.experimentType;
    this.experimentID = options.experimentID;
    this.atomType = options.atomType;
    this.label = options.label || {};
    this.signal = options.signal || {};
    this.link = options.link || [];
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

  checkAttachmentAtomType(atomType) {
    if (!lodash.get(this, `attachment.${atomType}`, false)) {
      this.attachment[atomType] = [];
    }
  }

  setAttachments(atomType, attachment) {
    this.checkAttachmentAtomType(atomType);
    this.attachment[atomType] = attachment;
  }

  addAttachment(atomType, attachment) {
    this.checkAttachmentAtomType(atomType);
    this.attachment[atomType].push(attachment);
  }

  getAttachments() {
    return this.attachment;
  }
}
