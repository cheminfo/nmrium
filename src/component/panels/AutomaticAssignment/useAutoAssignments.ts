import type { Spectrum, Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import type { SpectraData } from 'nmr-processing';
import { getAssignments as getAssignmentsData } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { useRef, useState } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { assert } from '../../utility/assert.js';

export interface AutoAssignmentsData {
  score: number;
  assignment: SpectraData[];
}

function mapSpectra(data: Spectrum[]) {
  return data.map((spectrum) => {
    const { id, info } = spectrum;
    const dimension = info.dimension;
    assert(dimension === 1 || dimension === 2, 'dimension must be 1 or 2');
    if (dimension === 1) {
      const ranges = (spectrum as Spectrum1D).ranges.values;
      return { id, info, ranges };
    } else {
      const zones = (spectrum as Spectrum2D).zones.values;
      return { id, info, zones };
    }
  });
}

export function useAutoAssignments() {
  const dispatch = useDispatch();
  const { data, molecules } = useChartData();
  const originData = useRef<SpectraData[]>();
  const toaster = useToaster();
  const [assignments, setAssignments] = useState<AutoAssignmentsData[]>([]);

  function restAssignments() {
    if (originData.current) {
      dispatch({
        type: 'SET_AUTOMATIC_ASSIGNMENTS',
        payload: { assignments: originData.current },
      });
    }
  }

  function getAssignments() {
    void (async () => {
      const hideLoading = toaster.showLoading({ message: 'Auto Assignments' });
      const molecule = OCL.Molecule.fromMolfile(molecules[0]?.molfile || '');
      const spectra = mapSpectra(data) as SpectraData[];

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
          type: 'SET_AUTOMATIC_ASSIGNMENTS',
          payload: { assignments: result[0].assignment },
        });
      } else {
        toaster.show({
          message:
            'Could not assign molecule, please check that all the ranges are defined correctly',
          intent: 'danger',
        });
      }

      setAssignments(result);
      hideLoading();
    })();
  }

  return { getAssignments, assignments, restAssignments };
}
