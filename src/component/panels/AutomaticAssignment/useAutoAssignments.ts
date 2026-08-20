import type { Spectrum } from '@zakodium/nmrium-core';
import { assertSpectrum2D, isSpectrum1D } from '@zakodium/nmrium-core';
import type { SpectraData } from 'nmr-processing';
import { getAssignments as getAssignmentsData } from 'nmr-processing';
import { Molecule } from 'openchemlib';
import { useRef, useState } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';

export interface AutoAssignmentsData {
  score: number;
  assignment: SpectraData[];
}

function mapSpectra(data: Spectrum[]): SpectraData[] {
  return data.map((spectrum) => {
    if (isSpectrum1D(spectrum)) {
      return {
        id: spectrum.id,
        info: spectrum.info,
        ranges: spectrum.ranges.values,
      };
    } else {
      assertSpectrum2D(spectrum);
      return {
        id: spectrum.id,
        info: spectrum.info,
        zones: spectrum.zones.values,
      };
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
      const molecule = Molecule.fromMolfile(molecules[0]?.molfile || '');
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
