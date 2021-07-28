import lodashGet from 'lodash/get';

import { ErrorColors } from './CorrelationTable/Constants';

function getAtomType(nucleus: string): string {
  return nucleus.split(/\d+/)[1];
}

function getLabelColor(correlationData, correlation) {
  const error = lodashGet(
    correlationData,
    `state.${correlation.atomType}.error`,
    null,
  );

  if (error) {
    for (let { key, color } of ErrorColors) {
      if (
        key !== 'incomplete' && // do not consider this for a single atom type
        (key === 'notAttached' || key === 'ambiguousAttachment') &&
        lodashGet(error, `${key}`, []).some(
          (index) => correlationData.values[index].id === correlation.id,
        )
      ) {
        return color;
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

function findSignal(spectrum, value) {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return zone.signals[signalIndex];
    }
  }
}

function findRange(spectrum, value) {
  for (let range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return range;
    }
  }
}

function findZone(spectrum, value) {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return zone;
    }
  }
}

function findRangeOrZoneID(spectraData, value) {
  const spectrum = findSpectrum(spectraData, value);
  if (spectrum) {
    if (spectrum.info.dimension === 1) {
      const range = findRange(spectrum, value);
      if (range) return range.id;
    } else if (spectrum.info.dimension === 2) {
      const zone = findZone(spectrum, value);
      if (zone) return zone.id;
    }
  }
}

function findSignalMatch1D(spectrum, link, factor, xDomain0, xDomain1) {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal(spectrum, link);
    if (signal) {
      const otherAxis = link.axis === 'x' ? 'y' : 'x';
      return (
        signal[otherAxis].delta * factor >= xDomain0 &&
        signal[otherAxis].delta * factor <= xDomain1
      );
    }
  }
  return false;
}

function findSignalMatch2D(
  spectrum,
  value,
  factor,
  xDomain0,
  xDomain1,
  yDomain0,
  yDomain1,
) {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal(spectrum, value);
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
}

export {
  findRange,
  findRangeOrZoneID,
  findSignalMatch1D,
  findSignalMatch2D,
  findSpectrum,
  findZone,
  getAtomType,
  getLabelColor,
};
