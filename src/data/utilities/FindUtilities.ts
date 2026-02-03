import type { Range, Signal1D, Signal2D, Zone } from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum2D, Spectrum } from '@zakodium/nmrium-core';

import { isSpectrum1D } from '../data1d/Spectrum1D/index.js';
import { isSpectrum2D } from '../data2d/Spectrum2D/index.js';

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
    if (signalIndex !== -1) {
      return range.signals[signalIndex];
    }
  }
  return undefined;
}

function findSignal2D(
  spectrum: Spectrum2D,
  signalID: string,
): Signal2D | undefined {
  for (const zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex !== -1) {
      return zone.signals[signalIndex];
    }
  }
  return undefined;
}

function findRange(spectrum: Spectrum1D, signalID: string): Range | undefined {
  for (const range of spectrum.ranges.values) {
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex !== -1) {
      return range;
    }
  }
  return undefined;
}

function findZone(spectrum: Spectrum2D, signalID: string): Zone | undefined {
  for (const zone of spectrum.zones.values) {
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signalID,
    );
    if (signalIndex !== -1) {
      return zone;
    }
  }
  return undefined;
}

function findRangeOrZoneID(
  spectraData: Spectrum[],
  experimentID: string,
  signalID: string,
  checkIsVisible: boolean,
) {
  const spectrum = findSpectrum(spectraData, experimentID, checkIsVisible);
  if (isSpectrum1D(spectrum)) {
    const range = findRange(spectrum, signalID);
    if (range) return range.id;
  } else if (isSpectrum2D(spectrum)) {
    const zone = findZone(spectrum, signalID);
    if (zone) return zone.id;
  }
  return undefined;
}

export {
  findRange,
  findRangeOrZoneID,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
};
