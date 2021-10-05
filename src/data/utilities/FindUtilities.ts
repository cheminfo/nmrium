import { Spectra } from '../../component/NMRium';
import { Datum1D, Range, Signal as Signal1D } from '../data1d/Spectrum1D';
import { Datum2D, Signal as Signal2D, Zone } from '../data2d/Spectrum2D';

function findSpectrum(
  spectraData: Spectra,
  spectrumID: string,
  checkIsVisible: boolean,
): Datum1D | Datum2D | undefined {
  const spectrum = spectraData.find((_spectrum) => _spectrum.id === spectrumID);
  if (
    spectrum &&
    checkIsVisible === true &&
    spectrum.display.isVisible === false
  ) {
    return undefined;
  }

  return spectrum;
}

function findSignal1D(
  spectrum: Datum1D,
  signalID: string,
): Signal1D | undefined {
  for (let range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return range.signals[signalIndex];
    }
  }
}

function findSignal2D(
  spectrum: Datum2D,
  signalID: string,
): Signal2D | undefined {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return zone.signals[signalIndex];
    }
  }
}

function findRange(spectrum: Datum1D, signalID: string): Range | undefined {
  for (let range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return range;
    }
  }
}

function findZone(spectrum: Datum2D, signalID: string): Zone | undefined {
  for (let zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return zone;
    }
  }
}

function findRangeOrZoneID(
  spectraData: Spectra,
  experimentID: string,
  signalID: string,
  checkIsVisible: boolean,
) {
  const spectrum = findSpectrum(spectraData, experimentID, checkIsVisible);
  if (spectrum) {
    if (spectrum.info.dimension === 1) {
      const range = findRange(spectrum as Datum1D, signalID);
      if (range) return range.id;
    } else if (spectrum.info.dimension === 2) {
      const zone = findZone(spectrum as Datum2D, signalID);
      if (zone) return zone.id;
    }
  }
}

export {
  findRange,
  findRangeOrZoneID,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
};
