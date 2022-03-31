import {
  getAssignments as getAssignmentsData,
  SpectraData,
  SpectraData1D,
  SpectraData2D,
} from 'nmr-processing';
import OCL from 'openchemlib/full';
import { useCallback, useMemo, useState } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d/Datum2D';
import { useChartData } from '../../context/ChartContext';
import { useAlert } from '../../elements/popup/Alert';

export interface AutoAssignmentsData {
  score: number;
  assignment: (SpectraData1D | SpectraData2D)[];
}

function mapSpectra(data: (Datum1D | Datum2D)[]) {
  return data.reduce<SpectraData[]>((acc, spectrum) => {
    const { id, info } = spectrum;
    const dimension = spectrum.info.dimension;
    if (dimension === 1) {
      const ranges = (spectrum as Datum1D).ranges.values;
      acc.push({ id, info, ranges });
    } else if (dimension === 2) {
      const zones = (spectrum as Datum2D).zones.values;
      acc.push({ id, info, zones });
    }
    return acc;
  }, []);
}

export function useGetAssignments() {
  const { data, molecules } = useChartData();
  const alert = useAlert();
  const [assignments, setAssignments] = useState<AutoAssignmentsData[]>([]);

  const getAssignments = useCallback(() => {
    void (async () => {
      const hideLoading = await alert.showLoading('Auto Assignments');
      const molecule = OCL.Molecule.fromMolfile(molecules[0]?.molfile || '');
      const spectra = mapSpectra(data);
      const result = await getAssignmentsData(
        {
          spectra,
          molecule,
        },
        { minScore: 0 },
      );
      hideLoading();
      setAssignments(result);
    })();
  }, [alert, data, molecules]);

  return useMemo(
    () => ({
      getAssignments,
      assignments,
    }),

    [assignments, getAssignments],
  );
}
