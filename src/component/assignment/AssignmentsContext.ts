import { createContext, useContext } from 'react';

export type Axis = 'x' | 'y';
/**
 * An object that associates each axis direction with a list of assigned diaIDs
 * depending on the assignment dimension (1D or 2D).
 *
 * - For **1D** assignments, only the `x` axis is used.
 * - For **2D** assignments, both the `x` and `y` axes are used.
 *
 * - The key (`Axis`) represents the **axis** (`'x'` or `'y'`).
 * - The value (`string[]`) contains the **assigned diaIDs** for that axis.
 */
export type Assignment = Record<Axis, string[]>;
/**
 * An object that associates each unique ID to their corresponding axis assignments.
 *
 * - The key (`string`) represents a **range ID, signal ID, or zone ID**.
 * - The value (`Assignment`) contains the assigned values mapped to axes.
 */
export type Assignments = Record<string, Assignment>;

export type AssignmentDimension = '1D' | '2D';
export interface AssignmentItem {
  id: string;
  axis: Axis | null;
}

export interface HighlightAssignmentOptions {
  id: string;
  axis?: Axis;
}
export interface ActivateAssignmentOptions {
  id: string;
  axis: Axis;
}

export const assignmentStatus: AssignmentStatus = {
  activated: null,
  highlighted: null,
};

export interface AssignmentStatus {
  activated: AssignmentItem | null;
  highlighted: AssignmentItem | null;
}
export interface AssignmentContext extends AssignmentStatus {
  data: Assignments;
  activate: (options: ActivateAssignmentOptions) => void;
  highlight: (options: HighlightAssignmentOptions) => void;
  clearHighlight: () => void;
}

export interface AssignmentsData extends AssignmentStatus {
  isActive: boolean;
  isHighlighted: boolean;
  /**
   * An object that associates each axis direction ('x' or 'y') with a list of assigned diaIDs for a specific ID,
   * depending on the assignment dimension (1D or 2D).
   *
   * - For **1D** assignments, only the `x` axis is used.
   * - For **2D** assignments, both the `x` and `y` axes are used.
   *
   * - The key (`Axis`) represents the **axis direction** (`'x'` or `'y'`).
   * - The value (`string[]`) is an array containing the **DiaIDs** assigned to that axis for the specific ID.
   */
  assignedDiaIds: Partial<Record<Axis, string[]>>;
  activate: (axis: Axis) => void;
  highlight: (axis?: Axis) => void;
  clearHighlight: () => void;
}

export const assignmentContext = createContext<AssignmentContext | null>(null);

export const AssignmentProvider = assignmentContext.Provider;

export function useAssignmentContext() {
  const context = useContext(assignmentContext);

  if (!context) {
    throw new Error('Assignment context was not found');
  }

  return context;
}

// key can be signal id,range id or zone id
export function useAssignment(id: string): AssignmentsData {
  const { data, activated, highlighted, activate, highlight, clearHighlight } =
    useAssignmentContext();

  const isActive = activated?.id === id;
  const isHighlighted = highlighted?.id === id;
  const assignedDiaIds = data?.[id] || {};

  function activateAssignment(axis: Axis) {
    if (id) {
      activate({
        id,
        axis,
      });
      return true;
    }

    return false;
  }

  function highlightAssignment(axis?: Axis) {
    if (id) {
      highlight({
        id,
        axis,
      });

      return true;
    }
    return false;
  }

  return {
    isActive,
    isHighlighted,
    assignedDiaIds,
    activated,
    highlighted,
    activate: activateAssignment,
    highlight: highlightAssignment,
    clearHighlight,
  };
}
