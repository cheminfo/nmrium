import lodash from 'lodash';

import { buildCorrelationsData, buildCorrelationsState } from './Utilities';

const defaultTolerance = {
  C: 0.25,
  H: 0.02,
  N: 0.25,
  F: 0.25,
  Si: 0.25,
  P: 0.25,
};

export default class CorrelationManager {
  constructor(options = {}, values = [], state = {}) {
    this.options = options;
    this.values = values;
    this.state = state;

    this.options.tolerance = this.options.tolerance || defaultTolerance;
  }

  getOptions() {
    return this.options;
  }

  setOptions(options = {}) {
    this.options = options;
  }

  setMF(mf) {
    this.setOptions({ ...this.getOptions(), mf });
  }

  unsetMF() {
    const _options = lodash.cloneDeep(this.options);
    delete _options.mf;
    this.setOptions(_options);
  }

  getMF() {
    return this.getOptions().mf;
  }

  setTolerance(tolerance) {
    this.setOptions({ ...this.getOptions(), tolerance });
  }

  unsetTolerance() {
    const _options = lodash.cloneDeep(this.options);
    delete _options.tolerance;
    this.setOptions(_options);
  }

  getTolerance() {
    return this.getOptions().tolerance;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  getValues() {
    return this.values;
  }

  getValuesByAtomType(atomType) {
    return this.values.filter(
      (correlation) => correlation.getAtomType() === atomType,
    );
  }

  getValueIndex(id) {
    return this.values.findIndex((correlation) => correlation.getID() === id);
  }

  getData() {
    return {
      options: Object.assign({}, this.options),
      values: this.values.slice(),
      state: Object.assign({}, this.state),
    };
  }

  addValue(correlation) {
    this.setValues(this.getValues().concat([correlation]));
  }

  deleteValue(id) {
    this.setValues(this.values.filter((correlation) => correlation.id !== id));
  }

  setValue(id, correlation) {
    let correlationIndex = this.values.findIndex((corr) => corr.id === id);
    const _values = this.values.slice();
    _values.splice(correlationIndex, 1, correlation);

    this.setValues(_values);
  }

  setValues(correlations) {
    this.values = correlations;
    this.setState(buildCorrelationsState(this.getData()));
  }

  buildValues(signals1D, signals2D) {
    this.setValues(
      buildCorrelationsData(signals1D, signals2D, this.getTolerance()),
    );
  }
}
