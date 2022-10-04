import {
  getAssignments as getAssignmentsData,
  SpectraData,
  SpectraData1D,
  SpectraData2D,
} from 'nmr-processing';
import OCL from 'openchemlib/full';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d/Datum2D';
import { Spectra } from '../../NMRium';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { SET_AUTOMATIC_ASSIGNMENTS } from '../../reducer/types/Types';

export interface AutoAssignmentsData {
  score: number;
  assignment: (SpectraData1D | SpectraData2D)[];
}

function mapSpectra(data: Spectra) {
  const spectra: SpectraData[] = [];
  data.forEach((spectrum) => {
    const { id, info } = spectrum;
    const dimension = spectrum.info.dimension;
    if (dimension === 1) {
      const ranges = (spectrum as Datum1D).ranges.values;
      spectra.push({ id, info, ranges });
    } else if (dimension === 2) {
      const zones = (spectrum as Datum2D).zones.values;
      spectra.push({ id, info, zones });
    }
  });
  return spectra;
}

export function useAutoAssignments() {
  const dispatch = useDispatch();
  const { data, molecules } = useChartData();
  const originData = useRef<SpectraData[]>();
  const alert = useAlert();
  const [assignments, setAssignments] = useState<AutoAssignmentsData[]>([]);

  const restAssignments = useCallback(() => {
    dispatch({
      type: SET_AUTOMATIC_ASSIGNMENTS,
      payload: { assignments: originData.current },
    });
  }, [dispatch]);

  const getAssignments = useCallback(() => {
    void (async () => {
      const hideLoading = await alert.showLoading('Auto Assignments');
      const molecule = OCL.Molecule.fromMolfile(molecules[0]?.molfile || '');
      const spectra = mapSpectra(data);

      if (!originData.current) {
        originData.current = spectra;
      }

      const result = await getAssignmentsData(
        {
          spectra,
          molecule,
        },
        { minScore: 0 },
      );

      if (result[0]?.assignment) {
        dispatch({
          type: SET_AUTOMATIC_ASSIGNMENTS,
          payload: { assignments: result[0].assignment },
        });
      } else {
        alert.error(
          'Could not assign molecule, please check that all the ranges are defined correctly',
        );
      }

      setAssignments(result);
      hideLoading();
    })();
  }, [alert, data, dispatch, molecules]);

  return useMemo(
    () => ({
      getAssignments,
      assignments,
      restAssignments,
    }),

    [assignments, getAssignments, restAssignments],
  );
}
