import type { Spectrum } from '@zakodium/nmrium-core';
import { isSpectrum1D } from '@zakodium/nmrium-core';
import type { DiaIDAndInfo } from 'openchemlib-utils';

import type { StateMoleculeExtended } from '../../../../data/molecules/Molecule.js';
import { useChartData } from '../../../context/ChartContext.js';

import { useExtractAtomAssignmentLabel } from './useExtractAtomAssignmentLabel.js';

export interface SignalAssignmentUpdate {
  spectrumId: string;
  signalId: string;
  assignment: string;
}

function getSignalsWithDiaIDs(spectrum: Spectrum) {
  if (isSpectrum1D(spectrum)) {
    return spectrum.ranges.values.flatMap((range) =>
      range.signals.map((signal) => ({
        signal,
        diaIDs: signal.diaIDs ?? [],
      })),
    );
  }

  return spectrum.zones.values.flatMap((zone) =>
    zone.signals.map((signal) => ({
      signal,
      diaIDs: [...(signal.x.diaIDs ?? []), ...(signal.y.diaIDs ?? [])],
    })),
  );
}

export function useSignalAssignmentUpdates() {
  const { data: spectra } = useChartData();
  const { getAssignmentLabelByDiaIDsForMolecule } =
    useExtractAtomAssignmentLabel();

  return (
    diaObject: DiaIDAndInfo,
    molecule: Pick<StateMoleculeExtended, 'id' | 'molfile'>,
  ): SignalAssignmentUpdate[] => {
    const changedDiaIDs = new Set([
      diaObject.idCode,
      ...diaObject.attachedHydrogensIDCodes,
    ]);
    const updates: SignalAssignmentUpdate[] = [];

    for (const spectrum of spectra) {
      const signalsWithDiaIDs = getSignalsWithDiaIDs(spectrum);

      for (const { signal, diaIDs } of signalsWithDiaIDs) {
        if (
          !signal.isAutoAssignment ||
          diaIDs.every((diaID) => !changedDiaIDs.has(diaID))
        ) {
          continue;
        }
        updates.push({
          spectrumId: spectrum.id,
          signalId: signal.id,
          assignment:
            getAssignmentLabelByDiaIDsForMolecule(
              diaIDs,
              molecule.id,
              molecule.molfile,
            ) ?? '',
        });
      }
    }

    return updates;
  };
}
