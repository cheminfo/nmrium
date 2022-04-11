import { Data1D } from '../../data/types/data1d';
import { Data2D } from '../../data/types/data2d';
import { ActionType } from '../reducer/types/Types';

import { AssignmentState, Axis } from './AssignmentsContext';
import addAssignment from './actions/addAssignment';
import initAssignment from './actions/initAssignment';
import removeAssignment from './actions/removeAssignment';
import setActiveAssignment from './actions/setActiveAssignment';

export type InitiateAction = ActionType<
  'INITIATE_ASSIGNMENTS',
  { spectra: (Data1D | Data2D)[] }
>;
export type ToggleAction = ActionType<'TOGGLE', { atomID: string; id: string }>;
export type AddAction = ActionType<
  'ADD',
  { id: string; atomID: string; axis: Axis }
>;
export type RemoveAction = ActionType<
  'REMOVE',
  { ids: string[]; atomID?: string; axis: Axis }
>;
export type SetActiveAction = ActionType<
  'SET_ACTIVE',
  { id: string; axis: Axis }
>;
export type ShowAction = ActionType<'SHOW', { id: string; axis?: Axis }>;

export type AssignmentsActions =
  | InitiateAction
  | ToggleAction
  | AddAction
  | RemoveAction
  | SetActiveAction
  | ShowAction
  | ActionType<'HIDE'>;

export default function assignmentReducer(
  state: AssignmentState,
  action: AssignmentsActions,
): AssignmentState {
  switch (action.type) {
    case 'INITIATE_ASSIGNMENTS': {
      return initAssignment(state, action);
    }
    case 'ADD': {
      return addAssignment(state, action.payload);
    }
    case 'REMOVE': {
      const { axis, ids, atomID } = action.payload;
      return removeAssignment(state, { axis, ids, atomID });
    }
    case 'TOGGLE': {
      const { id, atomID } = action.payload;
      const axis = state.activated?.axis;
      if (axis) {
        const atomIDs = state.assignment?.[id]?.[axis] || [];
        if (!atomIDs.includes(id)) {
          const { id } = action.payload;

          return addAssignment(state, { axis, id, atomID });
        } else {
          const { id, atomID } = action.payload;

          return removeAssignment(state, { atomID, axis, ids: [id] });
        }
      }
      return state;
    }
    case 'SET_ACTIVE': {
      return setActiveAssignment(state, action);
    }
    case 'SHOW': {
      const { id, axis } = action.payload;
      return {
        ...state,
        highlighted: {
          id,
          axis: axis || null,
        },
      };
    }
    case 'HIDE': {
      return {
        ...state,
        highlighted: null,
      };
    }

    default:
      return state;
  }
}
