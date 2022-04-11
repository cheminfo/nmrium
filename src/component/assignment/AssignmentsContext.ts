import { createContext, useCallback, useContext, useMemo } from 'react';

import { AssignmentsActions } from './AssignmentsReducer';

export type Axis = 'x' | 'y';
export type Assignments = Record<string, Record<Axis, string[]>>;

interface AssignmentItem {
  id: string;
  axis: Axis | null;
}
export interface AssignmentState {
  assignment: Assignments;
  activated: AssignmentItem | null;
  highlighted: AssignmentItem | null;
}
export interface AssignmentContext {
  assignment: AssignmentState;
  dispatch: (action: AssignmentsActions) => void;
}

export interface AssignmentsData
  extends Pick<AssignmentState, 'activated' | 'highlighted'> {
  id: string;
  isActive: boolean;
  isOver: boolean;
  assigned: Record<Axis, string[]>;
  removeAll: (axis: Axis) => void;
  toggle: (atomID: string) => void;
  setActive: (axis: Axis) => void;
  show: (axis?: Axis) => void;
  hide: () => void;
}

export const assignmentState: AssignmentState = {
  assignment: {},
  activated: null,
  highlighted: null,
};

export const assignmentContext = createContext<AssignmentContext>({
  assignment: assignmentState,
  dispatch: () => null,
});

export const AssignmentProvider = assignmentContext.Provider;

export function useAssignmentData() {
  const context = useContext(assignmentContext);

  if (!context) {
    throw new Error('Assignment context was not found');
  }

  return context;
}

// key can be signal id,range id or zone id
export function useAssignment(key): AssignmentsData {
  const {
    assignment: { activated, highlighted, assignment },
    dispatch,
  } = useAssignmentData();

  if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
    throw new Error(`assignment key must be a non-empty string or number`);
  }
  const id = String(key);

  const isActive = useMemo(() => {
    return activated?.id === id;
  }, [activated?.id, id]);
  const isOver = useMemo(() => {
    return highlighted?.id === id;
  }, [highlighted?.id, id]);

  const assigned = useMemo(() => {
    return assignment[id] || null;
  }, [assignment, id]);

  const removeAll = useCallback(
    (axis) => {
      dispatch({
        type: 'REMOVE',
        payload: { ids: [id], axis },
      });
    },
    [dispatch, id],
  );

  const toggle = useCallback(
    (atomID) => {
      dispatch({
        type: 'TOGGLE',
        payload: { atomID, id },
      });
    },
    [dispatch, id],
  );

  const setActive = useCallback(
    (axis: Axis) => {
      dispatch({
        type: 'SET_ACTIVE',
        payload: {
          id,
          axis,
        },
      });
    },
    [dispatch, id],
  );

  const show = useCallback(
    (axis?: Axis) => {
      dispatch({
        type: 'SHOW',
        payload: {
          id,
          axis,
        },
      });
    },
    [dispatch, id],
  );
  const hide = useCallback(() => {
    dispatch({
      type: 'HIDE',
    });
  }, [dispatch]);

  return {
    id,
    activated,
    isActive,
    isOver,
    highlighted,
    assigned,
    removeAll,
    toggle,
    setActive,
    show,
    hide,
  };
}
