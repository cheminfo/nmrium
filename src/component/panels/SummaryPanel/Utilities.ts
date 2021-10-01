import lodashGet from 'lodash/get';

import {
  Datum1D,
  Range,
  Signal as Signal1D,
} from '../../../data/data1d/Spectrum1D';
import {
  Datum2D,
  Signal as Signal2D,
  Zone,
} from '../../../data/data2d/Spectrum2D';
import { Spectra } from '../../NMRium';

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

function findSpectrum(
  spectraData: Spectra,
  value,
  checkIsVisible: boolean,
): Datum1D | Datum2D | undefined {
  const spectrum = spectraData.find(
    (_spectrum) => _spectrum.id === value.experimentID,
  );
  if (
    spectrum &&
    checkIsVisible === true &&
    spectrum.display.isVisible === false
  ) {
    return undefined;
  }

  return spectrum;
}

function findSignal1D(spectrum: Datum1D, value): Signal1D | undefined {
  for (let range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return range.signals[signalIndex];
    }
  }
}

function findSignal2D(spectrum: Datum2D, value): Signal2D | undefined {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return zone.signals[signalIndex];
    }
  }
}

function findRange(spectrum: Datum1D, value): Range | undefined {
  for (let range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return range;
    }
  }
}

function findZone(spectrum: Datum2D, value): Zone | undefined {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === value.signal.id,
    );
    if (signalIndex >= 0) {
      return zone;
    }
  }
}

function findRangeOrZoneID(
  spectraData: Spectra,
  value,
  checkIsVisible: boolean,
) {
  const spectrum = findSpectrum(spectraData, value, checkIsVisible);
  if (spectrum) {
    if (spectrum.info.dimension === 1) {
      const range = findRange(spectrum as Datum1D, value);
      if (range) return range.id;
    } else if (spectrum.info.dimension === 2) {
      const zone = findZone(spectrum as Datum2D, value);
      if (zone) return zone.id;
    }
  }
}

function findSignalMatch1D(
  spectrum: Datum2D,
  link,
  factor: number,
  xDomain0: number,
  xDomain1: number,
) {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, link);
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
  spectrum: Datum2D,
  value,
  factor: number,
  xDomain0: number,
  xDomain1: number,
  yDomain0: number,
  yDomain1: number,
): boolean {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, value);
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

function getAbbreviation(link): string {
  if (link.experimentType === 'hsqc' || link.experimentType === 'hmqc') {
    return !link.signal || link.signal.sign === 0
      ? 'S'
      : `S${link.signal.sign === 1 ? '+' : '-'}`;
  } else if (
    link.experimentType === 'hmbc' ||
    link.experimentType === 'cosy' ||
    link.experimentType === 'tocsy'
  ) {
    return 'M';
  } else if (
    link.experimentType === 'noesy' ||
    link.experimentType === 'roesy'
  ) {
    return 'NOE';
  } else if (link.experimentType === 'inadequate') {
    return 'I';
  } else if (link.experimentType === 'adequate') {
    return 'A';
  }

  return 'X';
}

export {
  findRange,
  findRangeOrZoneID,
  findSignal1D,
  findSignal2D,
  findSignalMatch1D,
  findSignalMatch2D,
  findSpectrum,
  findZone,
  getAbbreviation,
  getAtomType,
  getLabelColor,
};
