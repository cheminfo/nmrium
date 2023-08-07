import { useReducer, useMemo, useEffect, Reducer, ReactNode } from 'react';

import { useChartData } from '../context/ChartContext';

import {
  AssignmentContext,
  assignmentState,
  AssignmentState,
  assignmentContext,
} from './AssignmentsContext';
import assignmentReducer, { AssignmentsActions } from './AssignmentsReducer';

interface AssignmentProviderProps {
  children: ReactNode;
}

export function AssignmentProvider(props: AssignmentProviderProps) {
  const { children } = props;
  const { data: spectra } = useChartData();
  const [data, dispatch] = useReducer<
    Reducer<AssignmentState, AssignmentsActions>
  >(assignmentReducer, assignmentState);

  const state = useMemo<AssignmentContext>(() => ({ data, dispatch }), [data]);

  useEffect(() => {
    if (spectra) {
      dispatch({
        type: 'INITIATE_ASSIGNMENTS',
        // TODO: Fix this type error. It's been here for a long time because this component wasn't typed.
        // @ts-expect-error This should be fixed.
        payload: { spectra },
      });
    }
  }, [spectra]);

  return (
    <assignmentContext.Provider value={state}>
      {children}
    </assignmentContext.Provider>
  );
}
