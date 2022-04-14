import { Data1D } from '../../data/types/data1d';
import { Data2D } from '../../data/types/data2d';
import { ActionType } from '../reducer/types/Types';

import {
  AssignmentDimension,
  AssignmentState,
  Axis,
} from './AssignmentsContext';
import initAssignment from './actions/initAssignment';
import removeAssignments from './actions/removeAssignment';
import setActiveAssignment from './actions/setActiveAssignment';
import toggleAssignment from './actions/toggleAssignment';

export type InitiateAction = ActionType<
  'INITIATE_ASSIGNMENTS',
  { spectra: (Data1D | Data2D)[] }
>;
export type ToggleAction = ActionType<
  'TOGGLE',
  { atomIDs: string[]; id: string; dimension: AssignmentDimension }
>;
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
      return initAssignment(action);
    }
    case 'REMOVE': {
      const { axis, ids, atomID } = action.payload;
      return removeAssignments(state, { axis, ids, atomID });
    }
    case 'TOGGLE': {
      return toggleAssignment(state, action);
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
