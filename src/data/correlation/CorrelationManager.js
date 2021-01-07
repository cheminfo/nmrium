import Correlation from './Correlation';
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
  constructor(options = {}, values = []) {
    this.options = options;
    this.options.tolerance = this.options.tolerance || defaultTolerance;
    this.signals1D = {};
    this.signals2D = {};
    this.signalsDEPT = {};
    this.setValues(
      values.map((correlation) => new Correlation({ ...correlation })),
      this.signals1D,
      this.signals2D,
      this.signalsDEPT,
    );
  }

  getOptions() {
    return this.options;
  }

  setOptions(options = {}) {
    this.options = options;
  }

  setOption(key, value) {
    this.setOptions({ ...this.options, [key]: value });
  }

  deleteOption(key) {
    delete this.options[key];
  }

  setMF(mf) {
    this.setOption('mf', mf);
  }

  unsetMF() {
    this.deleteOption('mf');
  }

  getMF() {
    return this.getOptions().mf;
  }

  setTolerance(tolerance) {
    this.setOption('tolerance', tolerance);
  }

  getTolerance() {
    return this.getOptions().tolerance;
  }

  getState() {
    return this.state;
  }

  getValues() {
    return this.values;
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
    this.values = buildCorrelationsData(
      this.signals1D,
      this.signals2D,
      this.signalsDEPT,
      this.getMF(),
      this.getTolerance(),
      correlations,
    );
    this.state = buildCorrelationsState(this.getData());
  }

  updateValues(signals1D, signals2D, signalsDEPT) {
    this.signals1D = signals1D;
    this.signals2D = signals2D;
    this.signalsDEPT = signalsDEPT;
    this.setValues(this.getValues());
  }
}
