import { createContext, useCallback, useContext, useMemo } from 'react';

import { AssignmentsActions } from './AssignmentsReducer';

export type Axis = 'x' | 'y';
export type Assignment = Record<Axis, string[]>;
export type Assignments = Record<string, Assignment>;

export type AssignmentDimension = '1D' | '2D';
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
  assigned: Partial<Record<Axis, string[]>>;
  removeAll: (axis: Axis) => void;
  toggle: (atomIDs: string[], dimension: AssignmentDimension) => void;
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
export function useAssignment(key: number | string): AssignmentsData {
  const {
    data: { activated, highlighted, assignments },
    dispatch,
  } = useAssignmentData();

  if (!['string', 'number'].includes(typeof key)) {
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
    if (!(id in assignments)) {
      return {};
    }

    return assignments[id];
  }, [assignments, id]);

  const removeAll = useCallback(
    (axis: Axis) => {
      if (id) {
        dispatch({
          type: 'REMOVE',
          payload: { ids: [id], axis },
        });
        return true;
      }
      return false;
    },
    [dispatch, id],
  );

  const toggle = useCallback(
    (atomIDs: string[], dimension: AssignmentDimension) => {
      if (id) {
        dispatch({
          type: 'TOGGLE',
          payload: { atomIDs, id, dimension },
        });
        return true;
      }
      return false;
    },
    [dispatch, id],
  );

  const setActive = useCallback(
    (axis: Axis) => {
      if (id) {
        dispatch({
          type: 'SET_ACTIVE',
          payload: {
            id,
            axis,
          },
        });
        return true;
      }

      return false;
    },
    [dispatch, id],
  );

  const show = useCallback(
    (axis?: Axis) => {
      if (id) {
        dispatch({
          type: 'SHOW',
          payload: {
            id,
            axis,
          },
        });

        return true;
      }
      return false;
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
