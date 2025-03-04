import type { Reducer, ReactNode } from 'react';
import { useReducer, useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';

import type {
  AssignmentContext,
  AssignmentState,
} from './AssignmentsContext.js';
import { assignmentState, assignmentContext } from './AssignmentsContext.js';
import type { AssignmentsActions } from './AssignmentsReducer.js';
import assignmentReducer from './AssignmentsReducer.js';
import initAssignment from './actions/initAssignment.js';

interface AssignmentProviderProps {
  children: ReactNode;
}

export function AssignmentProvider(props: AssignmentProviderProps) {
  const { children } = props;
  const { data: spectra } = useChartData();
  const [{ activated, highlighted }, dispatch] = useReducer<
    Reducer<AssignmentState, AssignmentsActions>
  >(assignmentReducer, assignmentState);

  const state = useMemo<AssignmentContext>(() => {
    const assignments = initAssignment(spectra);
    // console.log(assignments);
    return { data: { activated, highlighted, assignments }, dispatch };
  }, [activated, highlighted, spectra]);

  // useEffect(() => {
  //   if (spectra) {
  //     dispatch({
  //       type: 'INITIATE_ASSIGNMENTS',
  //       // TODO: Fix this type error. It's been here for a long time because this component wasn't typed.
  //       // @ts-expect-error This should be fixed.
  //       payload: { spectra },
  //     });
  //   }
  // }, [spectra]);

  return (
    <assignmentContext.Provider value={state}>
      {children}
    </assignmentContext.Provider>
  );
}
