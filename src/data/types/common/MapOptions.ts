export type ShiftTarget = 'origin' | 'current';

export interface MapOptions {
  checkIsExisting?: boolean;
  shiftTarget?: ShiftTarget;
}
