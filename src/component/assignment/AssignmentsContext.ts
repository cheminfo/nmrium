import { createContext, useCallback, useContext, useMemo } from 'react';

import { AssignmentsActions } from './AssignmentsReducer';

export type Axis = 'x' | 'y';
export type Assignment = Record<Axis, string[]>;
export type Assignments = Record<string, Assignment>;

export interface AssignmentAction {
  id: string;
  axis: Axis | null;
}
export interface AssignmentState {
  assignments: Assignments;
  activated: AssignmentAction | null;
  highlighted: AssignmentAction | null;
}
export interface AssignmentContext {
  data: AssignmentState;
  dispatch: (action: AssignmentsActions) => void;
}

export interface AssignmentsData
  extends Pick<AssignmentState, 'activated' | 'highlighted'> {
  id: string;
  isActive: boolean;
  isOver: boolean;
  assigned: Record<Axis, string[]>;
  removeAll: (axis: Axis) => void;
  toggle: (atomIDs: string[]) => void;
  setActive: (axis: Axis) => void;
  show: (axis?: Axis) => void;
  hide: () => void;
}

export const assignmentState: AssignmentState = {
  assignments: {},
  activated: null,
  highlighted: null,
};

export const assignmentContext = createContext<AssignmentContext>({
  data: assignmentState,
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
    data: { activated, highlighted, assignments },
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
    return assignments[id] || null;
  }, [assignments, id]);

  const removeAll = useCallback(
    (axis: Axis) => {
      dispatch({
        type: 'REMOVE',
        payload: { ids: [id], axis },
      });
    },
    [dispatch, id],
  );

  const toggle = useCallback(
    (atomIDs: string[]) => {
      dispatch({
        type: 'TOGGLE',
        payload: { atomIDs, id },
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
