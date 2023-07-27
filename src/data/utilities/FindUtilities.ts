import { Spectrum, Spectrum1D, Spectrum2D } from 'nmr-load-save';
import { Range, Signal1D, Signal2D, Zone } from 'nmr-processing';

function findSpectrum(
  spectraData: Spectrum[],
  spectrumID: string,
  checkIsVisible: boolean,
): Spectrum | undefined {
  const spectrum = spectraData.find((_spectrum) => _spectrum.id === spectrumID);
  if (spectrum && checkIsVisible && !spectrum.display.isVisible) {
    return undefined;
  }

  return spectrum;
}

function findSignal1D(
  spectrum: Spectrum1D,
  signalID: string,
): Signal1D | undefined {
  for (const range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return range.signals[signalIndex];
    }
  }
}

function findSignal2D(
  spectrum: Spectrum2D,
  signalID: string,
): Signal2D | undefined {
  for (const zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return zone.signals[signalIndex];
    }
  }
}

function findRange(spectrum: Spectrum1D, signalID: string): Range | undefined {
  for (const range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return range;
    }
  }
}

function findZone(spectrum: Spectrum2D, signalID: string): Zone | undefined {
  for (const zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex >= 0) {
      return zone;
    }
  }
}

function findRangeOrZoneID(
  spectraData: Spectrum[],
  experimentID: string,
  signalID: string,
  checkIsVisible: boolean,
) {
  const spectrum = findSpectrum(spectraData, experimentID, checkIsVisible);
  if (spectrum) {
    if (spectrum.info.dimension === 1) {
      const range = findRange(spectrum as Spectrum1D, signalID);
      if (range) return range.id;
    } else if (spectrum.info.dimension === 2) {
      const zone = findZone(spectrum as Spectrum2D, signalID);
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
