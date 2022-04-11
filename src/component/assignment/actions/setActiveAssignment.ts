import { AssignmentState, SetActiveAction } from '..';

export default function setActiveAssignment(
  state: AssignmentState,
  action: SetActiveAction,
) {
  let { id, axis } = action.payload;
  const isActive = state.activated?.id === id;

  /**
   * {
      isActive: id !== null && axis !== null,
      id: !isActive ? id : null,
      axis: !isActive && id ? axis : null,
   */
  return {
    ...state,
    activated: !isActive ? { id, axis: axis || null } : null,
  };
}
