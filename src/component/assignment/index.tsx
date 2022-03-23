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
        ...(action.payload?.id
          ? {
              isOnHover: true,
              onHoverID: action.payload.id,
              onHoverAxis: action.payload.axis,
            }
          : {
              isOnHover: false,
              onHoverID: undefined,
              onHoverAxis: undefined,
            }),
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
    (range.diaIDs || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [range.id, _diaID], axis: 'x' },
      }),
    );
    range.signals.forEach((signal) =>
      (signal.diaIDs || []).forEach((_diaID) =>
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
    (zone.y.diaIDs || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [zone.id, _diaID], axis: 'y' },
      }),
    );
    (zone.x.diaIDs || []).forEach((_diaID) =>
      _contextValue.dispatch({
        type: 'ADD',
        payload: { id: [zone.id, _diaID], axis: 'x' },
      }),
    );
    zone.signals.forEach((signal) => {
      (signal.x.diaIDs || []).forEach((_diaID) =>
        _contextValue.dispatch({
          type: 'ADD',
          payload: { id: [signal.id, _diaID], axis: 'x' },
        }),
      );
      (signal.y.diaIDs || []).forEach((_diaID) =>
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
  const { dispatch, assignment } = useAssignmentData();

  if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
    throw new Error(`assignment key must be a non-empty string or number`);
  }
  const id = String(key);

  const isActive = useMemo(() => {
    return assignment.isActive && assignment.activeID === id;
  }, [assignment.activeID, assignment.isActive, id]);

  const activeAxis = useMemo(() => {
    return isActive ? assignment.activeAxis : undefined;
  }, [assignment.activeAxis, isActive]);

  const assigned = useMemo(() => {
    return assignment.assignment[id] ? assignment.assignment[id] : [];
  }, [assignment.assignment, id]);

  const isOnHover = useMemo(() => {
    return assignment.isOnHover && assignment.onHoverID === id;
  }, [assignment.isOnHover, assignment.onHoverID, id]);

  const onHoverAxis = useMemo(() => {
    return isOnHover ? assignment.onHoverAxis : undefined;
  }, [assignment.onHoverAxis, isOnHover]);

  const add = useCallback(
    (_id) => {
      dispatch({
        type: 'ADD',
        payload: { id: [id, _id], axis: activeAxis },
      });
    },
    [activeAxis, dispatch, id],
  );

  const remove = useCallback(
    (_id) => {
      dispatch({
        type: 'REMOVE',
        payload: { id: [id, _id], axis: activeAxis },
      });
    },
    [activeAxis, dispatch, id],
  );

  const removeAll = useCallback(
    (axis) => {
      dispatch({
        type: 'REMOVE_ALL',
        payload: { id: [id], axis },
      });
    },
    [dispatch, id],
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
    dispatch({
      type: 'DELETE_RECORD',
      payload: { id },
    });
  }, [dispatch, id]);

  const onClick = useCallback(
    (axis) => {
      dispatch({
        type: 'SET_IS_ACTIVE',
        payload: {
          id: !isActive ? id : undefined,
          axis: !isActive && id !== undefined ? axis : undefined,
        },
      });
    },
    [dispatch, id, isActive],
  );

  const setIsOnHover = useCallback(
    (action, axis) => {
      if (action === 'enter') {
        dispatch({
          type: 'SET_IS_ON_HOVER',
          payload: {
            id: id,
            axis: id !== undefined ? axis : undefined,
          },
        });
      } else if (action === 'leave') {
        dispatch({
          type: 'SET_IS_ON_HOVER',
          payload: {},
        });
      }
    },
    [dispatch, id],
  );

  const onMouseEnter = useCallback(
    (axis) => setIsOnHover('enter', axis),
    [setIsOnHover],
  );

  const onMouseLeave = useCallback(
    (axis) => setIsOnHover('leave', axis),
    [setIsOnHover],
  );
  // useWhatChanged(
  //   [
  //     id,
  //     isActive,
  //     activeAxis,
  //     assigned,
  //     add,
  //     remove,
  //     removeAll,
  //     toggle,
  //     deleteRecord,
  //     onClick,
  //     isOnHover,
  //     onHoverAxis,
  //     onMouseEnter,
  //     onMouseLeave,
  //   ],
  //   '  id,isActive,activeAxis,assigned,add,remove,removeAll,toggle,deleteRecord,onClick,isOnHover,onHoverAxis,onMouseEnter,onMouseLeave,',
  // );
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
