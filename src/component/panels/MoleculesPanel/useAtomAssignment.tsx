import type { Spectrum1D, Spectrum2D, Spectrum } from '@zakodium/nmrium-core';
import type { DiaIDAndInfo } from 'openchemlib-utils';
import type { MouseEvent } from 'react';
import { useMemo, useRef } from 'react';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/isSpectrum2D.ts';
import { ConcatenationString } from '../../../data/utilities/Concatenation.js';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated.js';
import { useTracesSpectra } from '../../2d/useTracesSpectra.ts';
import type { Assignments, Axis } from '../../assignment/AssignmentsContext.js';
import { useAssignmentContext } from '../../assignment/AssignmentsContext.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { HighlightEventSource } from '../../highlight/index.js';
import { useHighlightData } from '../../highlight/index.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import type { AtomData } from './Utilities.js';
import {
  extractFromAtom,
  getAssignIds,
  getCurrentDiaIDsToHighlight,
  getHighlightsOnHover,
  getUniqueDiaIDs,
} from './Utilities.js';

function flattenAssignedDiaIDs(assignments: Assignments) {
  const assignedDiaIDs: string[] = [];
  for (const id in assignments) {
    const { x = [], y = [] } = assignments[id];
    assignedDiaIDs.push(...x, ...y);
  }
  return assignedDiaIDs;
}

function isValidHighlightEventSource(type: HighlightEventSource) {
  return (
    type === 'ZONE' || type === 'RANGE' || type === 'ATOM' || type === 'SIGNAL'
  );
}

function getSignalsDiaIDs(
  spectrum: Spectrum,
  assignments: Assignments,
  highlightID: string,
) {
  // we are on range/zone level only, so add the belonging signal IDs to highlight too

  const assignIds = getAssignIds(spectrum, highlightID);

  if (!assignIds) return [];

  const [{ index }] = assignIds;
  if (isSpectrum1D(spectrum)) {
    const signals = spectrum.ranges.values[index].signals;
    return signals
      .filter((signal) => signal.id in assignments)
      .flatMap((signal) => signal?.diaIDs || []);
  }

  const signals = spectrum.zones.values[index].signals;
  return signals
    .filter((signal) => signal.id in assignments)
    .flatMap((signal) => [
      ...(signal.x?.diaIDs || []),
      ...(signal.y?.diaIDs || []),
    ]);
}

export default function useAtomAssignment() {
  const {
    data: spectra,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = useChartData();
  const spectrum = useSpectrum();
  const tracesSpectra = useTracesSpectra();

  const toaster = useToaster();
  const dispatch = useDispatch();
  const highlightData = useHighlightData();
  const highlightedIdDsRef = useRef<string[]>([]);
  const assignments = useAssignmentContext();
  const { activated: activatedAssignment } = assignments;

  const activatedKey = activatedAssignment
    ? activatedAssignment.id
    : ConcatenationString; // dummy value

  // used for atom highlighting for now, until we would like to highlight atoms per axis separately
  const assignedDiaIDsMerged = useMemo(
    () => flattenAssignedDiaIDs(assignments.data),
    [assignments],
  );

  const currentDiaIDsToHighlight = useMemo(() => {
    const { highlighted, sourceData } = highlightData.highlight;
    const { type, extra } = sourceData || {};
    const { spectrumID } = extra || {};

    let currentSpectrum = spectrum;

    if (isSpectrum2D(spectrum) && spectrumID) {
      const traceSpectrum = tracesSpectra.find(
        (traceSpectrum) => traceSpectrum.id === spectrumID,
      );
      if (traceSpectrum) {
        currentSpectrum = traceSpectrum;
      }
    }

    if (!type || !isValidHighlightEventSource(type) || !currentSpectrum) {
      return [];
    }

    const highlightedAssignmentsIDs = highlighted.filter((highlightID) => {
      return assignments.data[highlightID];
    });

    const highlights = highlightedAssignmentsIDs.flatMap((highlightID) =>
      getSignalsDiaIDs(currentSpectrum, assignments.data, highlightID),
    );
    return getCurrentDiaIDsToHighlight(assignments).concat(highlights);
  }, [assignments, highlightData.highlight, spectrum, tracesSpectra]);

  function assign1DAtom(spectrum: Spectrum1D, key: string, atom: AtomData) {
    const assignKeys = getAssignIds(spectrum, key);

    if (!assignKeys) return;
    const [{ index: rangeIndex }] = assignKeys;
    const {
      id: spectrumId,
      ranges: { values },
    } = spectrum;
    const range = values[rangeIndex];

    let diaIDs: string[] = [];

    if (assignKeys?.length === 1) {
      diaIDs = range?.diaIDs || [];
    } else {
      const [, { index: signalIndex }] = assignKeys;
      diaIDs = range?.signals[signalIndex]?.diaIDs || [];
    }
    const uniqueDiaIDs = getUniqueDiaIDs(diaIDs, atom);

    dispatch({
      type: 'ASSIGN_RANGE',
      payload: {
        nbAtoms: uniqueDiaIDs.nbAtoms,
        diaIDs: uniqueDiaIDs.diaIDs,
        keys: assignKeys,
        spectrumId,
      },
    });
  }
  function assign2DAtom(
    spectrum: Spectrum2D,
    key: string,
    atom: AtomData,
    axis: Axis,
  ) {
    const assignKeys = getAssignIds(spectrum, key);

    if (!assignKeys) return;
    const [{ index: zoneIndex }] = assignKeys;
    const zone = spectrum.zones.values[zoneIndex];

    let diaIDs: string[] = [];

    if (assignKeys?.length === 1) {
      diaIDs = zone[axis]?.diaIDs || [];
    } else {
      const [, { index: signalIndex }] = assignKeys;
      diaIDs = zone?.signals[signalIndex][axis]?.diaIDs || [];
    }

    const uniqueDiaIDs = getUniqueDiaIDs(diaIDs, atom);
    dispatch({
      type: 'ASSIGN_ZONE',
      payload: {
        keys: assignKeys,
        nbAtoms: uniqueDiaIDs.nbAtoms,
        diaIDs: uniqueDiaIDs.diaIDs,
        axis,
      },
    });
  }

  function handleOnClickAtom(
    diaIDAndInfo: DiaIDAndInfo | undefined,
    event: MouseEvent,
  ) {
    if (checkModifierKeyActivated(event) || !activatedAssignment) return;

    event.preventDefault(); // prevent floating form custom label edit
    const { axis, id } = activatedAssignment;

    if (!id || !axis) {
      return;
    }
    const atomInformation = extractFromAtom(diaIDAndInfo, nucleus, axis);

    if (atomInformation.nbAtoms === 0) {
      return toaster.show({
        message:
          'Not assigned! Different atom type or no attached hydrogens found!',
      });
    }

    // save assignment in assignment hook
    // save assignment (diaIDs) in range/zone data

    // determine the level of setting the diaIDs array (range vs. signal level) and save there
    // let nbAtoms = 0;
    // on range/zone level
    const currentSpectrum = activatedAssignment.spectrumId
      ? spectra.find(
          (spectrum) => spectrum.id === activatedAssignment.spectrumId,
        )
      : spectrum;

    if (!currentSpectrum) return;

    if (isSpectrum1D(currentSpectrum)) {
      assign1DAtom(currentSpectrum, activatedAssignment.id, atomInformation);
    } else {
      assign2DAtom(
        currentSpectrum,
        activatedAssignment.id,
        atomInformation,
        axis,
      );
    }
    assignments.activate({ id: activatedKey, axis });
  }

  function handleOnAtomHover(diaIDAndInfo: DiaIDAndInfo | undefined) {
    const { oclIDs } = extractFromAtom(diaIDAndInfo, nucleus);
    // on enter the atom
    if (oclIDs.length > 0) {
      // set all IDs to highlight when hovering over an atom from assignment data
      const highlights = getHighlightsOnHover(assignments, oclIDs, [
        spectrum,
        ...tracesSpectra,
      ]);
      highlightedIdDsRef.current = highlights;
      highlightData.dispatch({
        type: 'SHOW',
        payload: {
          convertedHighlights: highlights,
          sourceData: { type: 'ATOM' },
        },
      });
    } else {
      highlightData.dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: highlightedIdDsRef.current },
      });
      highlightedIdDsRef.current = [];
    }
  }

  return {
    handleOnAtomHover,
    handleOnClickAtom,
    currentDiaIDsToHighlight,
    assignedDiaIDsMerged,
  };
}
