import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useChartData } from '../context/ChartContext.js';

import type {
  ActivateAssignmentOptions,
  AssignmentContext,
  HighlightAssignmentOptions,
  AssignmentStatus,
} from './AssignmentsContext.js';
import { assignmentContext, assignmentStatus } from './AssignmentsContext.js';
import { getAssignments } from './utilities/getAssignments.js';

interface AssignmentProviderProps {
  children: ReactNode;
}

export function AssignmentProvider(props: AssignmentProviderProps) {
  const { children } = props;
  const { data: spectra } = useChartData();
  const [{ activated, highlighted }, setState] =
    useState<AssignmentStatus>(assignmentStatus);

  const memoState = useMemo<AssignmentContext>(() => {
    const activate = (options: ActivateAssignmentOptions) => {
      setState((prevState) => ({
        ...prevState,
        activated: !prevState.activated
          ? { id: options.id, axis: options.axis || null }
          : null,
      }));
    };

    const highlight = (options: HighlightAssignmentOptions) => {
      setState((prevState) => ({
        ...prevState,
        highlighted: {
          id: options.id,
          axis: options.axis || null,
        },
      }));
    };

    const clearHighlight = () => {
      setState((prevState) => ({
        ...prevState,
        highlighted: null,
      }));
    };

    const assignments = getAssignments(spectra);
    return {
      data: assignments,
      activated,
      highlighted,
      highlight,
      clearHighlight,
      activate,
    };
  }, [activated, highlighted, spectra]);

  return (
    <assignmentContext.Provider value={memoState}>
      {children}
    </assignmentContext.Provider>
  );
}
