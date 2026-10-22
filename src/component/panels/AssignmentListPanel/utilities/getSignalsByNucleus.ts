import type { Spectrum } from '@zakodium/nmrium-core';
import { isSpectrum1D } from '@zakodium/nmrium-core';

import type {
  AssignedSignal,
  AssignmentSpectrum,
  SignalsByNucleus,
} from './types.js';

/**
 * Build a nucleus to oclIDs lookup of assigned 1D signals.
 *
 * @returns A map containing an OCL ID lookup for each 1D nucleus, including
 * nuclei without assignments so their columns remain visible.
 * Only the spectrum ID, nucleus, and frequency are retained in a shared metadata
 * object.
 *
 * Notes:
 * 1. Unassigned signals are omitted.
 * 2. Repeated IDs within a signal occur once.
 */
export function getSignalsByNucleus(spectra: Spectrum[]): SignalsByNucleus {
  const signalsByNucleus = new Map<string, Map<string, AssignedSignal[]>>();
  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;

    // Share one atom-group lookup across all 1D spectra of the same nucleus.
    // Create it even without assignments so the nucleus column stays visible.
    const nucleus = spectrum.info.nucleus;
    let signalsByOclID = signalsByNucleus.get(nucleus);

    if (!signalsByOclID) {
      signalsByOclID = new Map();
      signalsByNucleus.set(nucleus, signalsByOclID);
    }
    // Keep each spectrum's frequency for formatting its own coupling values.
    const assignmentSpectrum: AssignmentSpectrum = {
      id: spectrum.id,
      info: {
        nucleus: spectrum.info.nucleus,
        originFrequency: spectrum.info.originFrequency,
      },
    };
    for (const range of spectrum.ranges.values) {
      for (const signal of range.signals) {
        const entry = { spectrum: assignmentSpectrum, range, signal };
        // Index a signal under every linked group, without repeating a link.
        for (const oclID of new Set(signal.diaIDs)) {
          const entries = signalsByOclID.get(oclID);
          if (entries) {
            entries.push(entry);
          } else {
            signalsByOclID.set(oclID, [entry]);
          }
        }
      }
    }
  }
  return signalsByNucleus;
}
