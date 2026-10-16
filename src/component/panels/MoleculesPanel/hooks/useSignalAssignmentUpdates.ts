import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
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

function hasChangedDiaID(diaIDs: string[], changedDiaIDs: Set<string>) {
  return diaIDs.some((diaID) => changedDiaIDs.has(diaID));
}

function isAffectedSignal(
  signal: { isAutoAssignment?: boolean },
  diaIDs: string[],
  changedDiaIDs: Set<string>,
) {
  return (
    Boolean(signal.isAutoAssignment) && hasChangedDiaID(diaIDs, changedDiaIDs)
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
    // #1 Track the changed atom and any attached hydrogens.
    const changedDiaIDs = new Set([
      diaObject.idCode,
      ...diaObject.attachedHydrogensIDCodes,
    ]);
    const updatedAssignments: SignalAssignmentUpdate[] = [];

    // #2 Recalculate assignments only for affected range and zone signals.
    function getRangeSignalUpdates(spectrum: Spectrum1D) {
      const signalUpdates: SignalAssignmentUpdate[] = [];

      for (const range of spectrum.ranges.values) {
        for (const signal of range.signals) {
          const diaIDs = signal.diaIDs ?? [];
          if (!isAffectedSignal(signal, diaIDs, changedDiaIDs)) {
            continue;
          }

          signalUpdates.push({
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

      return signalUpdates;
    }

    function getZoneSignalUpdates(spectrum: Spectrum2D) {
      const signalUpdates: SignalAssignmentUpdate[] = [];

      for (const zone of spectrum.zones.values) {
        for (const signal of zone.signals) {
          const dimensions = [signal.y.diaIDs ?? [], signal.x.diaIDs ?? []];
          const diaIDs = dimensions.flat();
          if (!isAffectedSignal(signal, diaIDs, changedDiaIDs)) {
            continue;
          }

          // #3 Use the edited molecule only for dimensions containing changed IDs.
          const labels = dimensions.flatMap((axisDiaIDs) => {
            const molfile = hasChangedDiaID(axisDiaIDs, changedDiaIDs)
              ? molecule.molfile
              : undefined;
            return (
              getAssignmentLabelByDiaIDsForMolecule(
                axisDiaIDs,
                molecule.id,
                molfile,
              ) ?? ''
            ).split(',');
          });

          signalUpdates.push({
            spectrumId: spectrum.id,
            signalId: signal.id,
            assignment: [
              ...new Set(labels.map((label) => label.trim()).filter(Boolean)),
            ].join(','),
          });
        }
      }

      return signalUpdates;
    }

    for (const spectrum of spectra) {
      if (isSpectrum1D(spectrum)) {
        updatedAssignments.push(...getRangeSignalUpdates(spectrum));
      } else {
        updatedAssignments.push(...getZoneSignalUpdates(spectrum));
      }
    }

    return updatedAssignments;
  };
}
