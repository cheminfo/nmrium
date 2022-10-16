import { assert } from 'console';

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
  return data.map((spectrum) => {
    const { id, info } = spectrum;
    const dimension = info.dimension;
    assert(dimension === 1 || dimension === 2, 'dimension must be 1 or 2');
    if (dimension === 1) {
      const ranges = (spectrum as Datum1D).ranges.values;
      return { id, info, ranges };
    } else {
      const zones = (spectrum as Datum2D).zones.values;
      return { id, info, zones };
    }
  });
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
