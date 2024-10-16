import { NmrData1D, NmrData2D } from 'cheminfo-types';

import { ActionType } from '../reducer/types/ActionType.js';

import {
  AssignmentDimension,
  AssignmentState,
  Axis,
} from './AssignmentsContext.js';
import initAssignment from './actions/initAssignment.js';
import removeAssignments from './actions/removeAssignment.js';
import setActiveAssignment from './actions/setActiveAssignment.js';
import toggleAssignment from './actions/toggleAssignment.js';

export type InitiateAction = ActionType<
  'INITIATE_ASSIGNMENTS',
  { spectra: Array<NmrData1D | NmrData2D> }
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
