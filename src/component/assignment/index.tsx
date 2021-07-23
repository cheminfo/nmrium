/* eslint-disable @typescript-eslint/no-dynamic-delete */
import {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react';

const assignmentContext = createContext<any>({});

function assignmentReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const newState = {
        ...state,
        assignment: { ...state.assignment },
      };
      if (newState.assignment[action.payload.id[0]] === undefined) {
        newState.assignment[action.payload.id[0]] = {};
      }
      if (
        newState.assignment[action.payload.id[0]][action.payload.axis] ===
        undefined
      ) {
        newState.assignment[action.payload.id[0]][action.payload.axis] = [];
      }
      // avoid duplicates
      if (
        !newState.assignment[action.payload.id[0]][
          action.payload.axis
        ].includes(action.payload.id[1])
      ) {
        newState.assignment[action.payload.id[0]][action.payload.axis].push(
          action.payload.id[1],
        );
      }

      return newState;
    }
    case 'REMOVE': {
      const newState = {
        ...state,
        assignment: { ...state.assignment },
      };
      if (
        newState.assignment[action.payload.id[0]]?.[action.payload.axis] !==
        undefined
      ) {
        newState.assignment[action.payload.id[0]][action.payload.axis] =
          newState.assignment[action.payload.id[0]][action.payload.axis].filter(
            (_id) => _id !== action.payload.id[1],
          );

        if (
          newState.assignment[action.payload.id[0]][action.payload.axis]
            .length === 0
        ) {
          delete newState.assignment[action.payload.id[0]][action.payload.axis];
        }
        if (
          Object.keys(newState.assignment[action.payload.id[0]]).length === 0
        ) {
          delete newState.assignment[action.payload.id[0]];
        }
      }

      return newState;
    }
    case 'REMOVE_ALL': {
      const newState = {
        ...state,
        assignment: { ...state.assignment },
      };
      // takes an array now to delete multiple identifiers
      action.payload.id.forEach((_id) => {
        if (newState.assignment[_id]?.[action.payload.axis] !== undefined) {
          delete newState.assignment[_id][action.payload.axis];
          if (Object.keys(newState.assignment[_id]).length === 0) {
            delete newState.assignment[_id];
          }
        }
      });

      return newState;
    }
    case 'SET_IS_ACTIVE': {
      return {
        ...state,
        isActive:
          action.payload.id !== undefined && action.payload.axis !== undefined,
        activeID: action.payload.id,
        activeAxis: action.payload.axis,
      };
    }
    case 'SET_IS_ON_HOVER': {
      return {
        ...state,
        isOnHover: action.payload.id !== undefined,
        onHoverID: action.payload.id,
        onHoverAxis: action.payload.axis,
      };
    }
    case 'DELETE_RECORD': {
      const newState = {
        ...state,
        assignment: { ...state.assignment },
      };

      delete newState.assignment[action.payload.id];

      if (newState.isActive && newState.activeID === action.payload.id) {
        newState.isActive = false;
        newState.activeID = undefined;
        newState.activeAxis = undefined;
      }
      if (newState.isOnHover && newState.onHoverID === action.payload.id) {
        newState.isOnHover = false;
        newState.onHoverID = undefined;
        newState.onHoverAxis = undefined;
      }

      return newState;
    }
    default: {
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

const emptyState = {
  assignment: {},
  isActive: false,
  activeID: undefined,
  activeAxis: undefined,
  isOnHover: false,
  onHoverID: undefined,
  onHoverAxis: undefined,
};

export function AssignmentProvider(props) {
  const { spectraData } = props;
  const [assignment, dispatch] = useReducer(assignmentReducer, emptyState);
  const contextValue = useMemo(() => ({ assignment, dispatch }), [assignment]);

  function initAssignmentDataRanges(range, _contextValue) {
    _contextValue.dispatch({
      type: 'DELETE_RECORD',
      payload: { id: range.id },
    });
    (range.diaID || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [range.id, _diaID], axis: 'x' },
      }),
    );
    range.signals.forEach((signal) =>
      (signal.diaID || []).forEach((_diaID) =>
        _contextValue.dispatch({
          type: 'ADD',
          payload: { id: [signal.id, _diaID], axis: 'x' },
        }),
      ),
    );
  }

  function initAssignmentDataZones(zone, _contextValue) {
    _contextValue.dispatch({
      type: 'DELETE_RECORD',
      payload: { id: zone.id },
    });
    (zone.y.diaID || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [zone.id, _diaID], axis: 'y' },
      }),
    );
    (zone.x.diaID || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [zone.id, _diaID], axis: 'x' },
      }),
    );
    zone.signals.forEach((signal) => {
      (signal.x.diaID || []).forEach((_diaID) =>
        _contextValue.dispatch({
          type: 'ADD',
          payload: { id: [signal.id, _diaID], axis: 'x' },
        }),
      );
      (signal.y.diaID || []).forEach((_diaID) =>
        _contextValue.dispatch({
          type: 'ADD',
          payload: { id: [signal.id, _diaID], axis: 'y' },
        }),
      );
    });
  }

  useEffect(() => {
    if (spectraData) {
      spectraData.forEach((spectrum) => {
        if (spectrum.info.dimension === 1) {
          spectrum.ranges.values.forEach((range) =>
            initAssignmentDataRanges(range, contextValue),
          );
        } else if (spectrum.info.dimension === 2) {
          spectrum.zones.values.forEach((zone) =>
            initAssignmentDataZones(zone, contextValue),
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spectraData]);

  return (
    <assignmentContext.Provider value={contextValue}>
      {props.children}
    </assignmentContext.Provider>
  );
}

export function useAssignmentData() {
  return useContext(assignmentContext);
}

export function useAssignment(key) {
  const context = useAssignmentData();

  if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
    throw new Error(`assignment key must be a non-empty string or number`);
  }
  const id = String(key);

  const isActive = useMemo(() => {
    return context.assignment.isActive && context.assignment.activeID === id;
  }, [context.assignment.activeID, context.assignment.isActive, id]);

  const activeAxis = useMemo(() => {
    return isActive ? context.assignment.activeAxis : undefined;
  }, [context.assignment.activeAxis, isActive]);

  const assigned = useMemo(() => {
    return context.assignment.assignment[id]
      ? context.assignment.assignment[id]
      : [];
  }, [context.assignment.assignment, id]);

  const isOnHover = useMemo(() => {
    return context.assignment.isOnHover && context.assignment.onHoverID === id;
  }, [context.assignment.isOnHover, context.assignment.onHoverID, id]);

  const onHoverAxis = useMemo(() => {
    return isOnHover ? context.assignment.onHoverAxis : undefined;
  }, [context.assignment.onHoverAxis, isOnHover]);

  const add = useCallback(
    (_id) => {
      context.dispatch({
        type: 'ADD',
        payload: { id: [id, _id], axis: activeAxis },
      });
    },
    [activeAxis, context, id],
  );

  const remove = useCallback(
    (_id) => {
      context.dispatch({
        type: 'REMOVE',
        payload: { id: [id, _id], axis: activeAxis },
      });
    },
    [activeAxis, context, id],
  );

  const removeAll = useCallback(
    (axis) => {
      context.dispatch({
        type: 'REMOVE_ALL',
        payload: { id: [id], axis },
      });
    },
    [context, id],
  );

  const toggle = useCallback(
    (_id) => {
      if (
        assigned[activeAxis] === undefined ||
        !assigned[activeAxis].includes(_id)
      ) {
        add(_id);
      } else {
        remove(_id);
      }
    },
    [activeAxis, add, assigned, remove],
  );

  // totally deletion of a record from assignment storage
  const deleteRecord = useCallback(() => {
    context.dispatch({
      type: 'DELETE_RECORD',
      payload: { id },
    });
  }, [context, id]);

  const onClick = useCallback(
    (axis) => {
      context.dispatch({
        type: 'SET_IS_ACTIVE',
        payload: {
          id: !isActive ? id : undefined,
          axis: !isActive && id !== undefined ? axis : undefined,
        },
      });
    },
    [context, id, isActive],
  );

  const setIsOnHover = useCallback(
    (action, axis) => {
      if (action === 'enter') {
        context.dispatch({
          type: 'SET_IS_ON_HOVER',
          payload: {
            id: id,
            axis: id !== undefined ? axis : undefined,
          },
        });
      } else if (action === 'leave') {
        context.dispatch({
          type: 'SET_IS_ON_HOVER',
          payload: {},
        });
      }
    },
    [context, id],
  );

  const onMouseEnter = useCallback(
    (axis) => setIsOnHover('enter', axis),
    [setIsOnHover],
  );

  const onMouseLeave = useCallback(
    (axis) => setIsOnHover('leave', axis),
    [setIsOnHover],
  );

  return {
    id,
    isActive,
    activeAxis,
    assigned,
    add,
    remove,
    removeAll,
    toggle,
    deleteRecord,
    onClick,
    isOnHover,
    onHoverAxis,
    onMouseEnter,
    onMouseLeave,
  };
}

export function filterForIDsWithAssignment(assignmentData, ids) {
  return ids.filter((id) =>
    Object.keys(assignmentData.assignment).filter((_id) => _id === id),
  );
}
