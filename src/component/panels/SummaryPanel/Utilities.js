import lodashGet from 'lodash/get';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

function getAtomType(nucleus) {
  return nucleus.split(/\d+/)[1];
}

function getLabelColor(correlationData, correlation) {
  const error = lodashGet(
    correlationData,
    `state.${correlation.getAtomType()}.error`,
    null,
  );
  if (error) {
    for (let errorIndex in Errors) {
      if (
        ErrorColors[errorIndex].key !== 'incomplete' && // do not consider this for a single atom type
        (ErrorColors[errorIndex].key === 'notAttached' ||
          ErrorColors[errorIndex].key === 'ambiguousAttachment') &&
        lodashGet(error, `${ErrorColors[errorIndex].key}`, []).some(
          (index) =>
            correlationData.values[index].getID() === correlation.getID(),
        )
      ) {
        return ErrorColors[errorIndex].color;
      }
    }
  }

  return null;
}

function findSpectrum(spectraData, value) {
  return spectraData.filter(
    (_spectrum) =>
      _spectrum.id === value.experimentID &&
      _spectrum.display.isVisible === true,
  )[0];
}
const findSignalMatch1D = (
  spectrum,
  value,
  link,
  factor,
  xDomain0,
  xDomain1,
) => {
  if (spectrum && spectrum.info.dimension === 2) {
    let signal;
    for (let i = 0; i < spectrum.zones.values.length; i++) {
      const signalIndex = spectrum.zones.values[i].signal.findIndex(
        (_signal) => _signal.id === link.signal.id,
      );
      if (signalIndex >= 0) {
        signal = spectrum.zones.values[i].signal[signalIndex];
        break;
      }
    }
    if (signal) {
      const otherAxis = link.axis === 'x' ? 'y' : 'x';
      return (
        signal[otherAxis].delta * factor >= xDomain0 &&
        signal[otherAxis].delta * factor <= xDomain1
      );
    }
  }
  return false;
};
const findSignalMatch2D = (
  spectrum,
  value,
  factor,
  xDomain0,
  xDomain1,
  yDomain0,
  yDomain1,
) => {
  if (spectrum && spectrum.info.dimension === 2) {
    let signal;
    for (let i = 0; i < spectrum.zones.values.length; i++) {
      const signalIndex = spectrum.zones.values[i].signal.findIndex(
        (_signal) => _signal.id === value.signal.id,
      );
      if (signalIndex >= 0) {
        signal = spectrum.zones.values[i].signal[signalIndex];
        break;
      }
    }
    if (signal) {
      return (
        signal.x.delta * factor >= xDomain0 &&
        signal.x.delta * factor <= xDomain1 &&
        signal.y.delta * factor >= yDomain0 &&
        signal.y.delta * factor <= yDomain1
      );
    }
  }
  return false;
};

export {
  findSignalMatch1D,
  findSignalMatch2D,
  findSpectrum,
  getAtomType,
  getLabelColor,
};
