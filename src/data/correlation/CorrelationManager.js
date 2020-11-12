import lodash from 'lodash';

import Correlation from './Correlation';
import {
  buildCorrelationsData,
  buildCorrelationsState,
  checkSignalMatch,
} from './Utilities';

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
    this.setValues(
      values.map((correlation) => new Correlation({ ...correlation })),
    );
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
    this.values = correlations;
    this.state = buildCorrelationsState(this.getData());
  }

  updateValues(signals1D, signals2D) {
    const _correlations = buildCorrelationsData(
      signals1D,
      signals2D,
      this.getTolerance(),
      lodash.cloneDeep(this.getValues()),
    );

    // important after data file import: set to the previous counts because they will be overwritten by default value (1)
    this.getValues().forEach((correlation) => {
      const index = _correlations.findIndex(
        (_correlation) =>
          correlation.getAtomType() === _correlation.getAtomType() &&
          correlation.getExperimentType() ===
            _correlation.getExperimentType() &&
          checkSignalMatch(
            correlation.getSignal(),
            _correlation.getSignal(),
            0.0,
          ),
      );
      if (index >= 0) {
        _correlations[index].setCount(correlation.getCount());
      }
    });

    this.setValues(_correlations);
  }
}
