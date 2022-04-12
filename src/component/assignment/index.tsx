import { useReducer, useMemo, useEffect, Reducer } from 'react';

import {
  AssignmentContext,
  assignmentState,
  AssignmentState,
  assignmentContext,
} from './AssignmentsContext';
import assignmentReducer, { AssignmentsActions } from './AssignmentsReducer';

export function AssignmentProvider(props) {
  const { spectraData: spectra } = props;
  const [data, dispatch] = useReducer<
    Reducer<AssignmentState, AssignmentsActions>
  >(assignmentReducer, assignmentState);

  const state = useMemo<AssignmentContext>(() => ({ data, dispatch }), [data]);

  useEffect(() => {
    if (spectra) {
      dispatch({
        type: 'INITIATE_ASSIGNMENTS',
        payload: { spectra },
      });
    }
  }, [spectra]);

  return (
    <assignmentContext.Provider value={state}>
      {props.children}
    </assignmentContext.Provider>
  );
}
