export const positions = {
  TOP_LEFT: 'top left',
  TOP_CENTER: 'top center',
  TOP_RIGHT: 'top right',
  MIDDLE_LEFT: 'middle left',
  MIDDLE: 'middle',
  MIDDLE_RIGHT: 'middle right',
  BOTTOM_LEFT: 'bottom left',
  BOTTOM_CENTER: 'bottom center',
  BOTTOM_RIGHT: 'bottom right',
} as const;
export type Position = (typeof positions)[keyof typeof positions];

export const types = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  PROGRESS_INDICATOR: 'progress_indicator',
} as const;
export type Type = (typeof types)[keyof typeof types];

export const transitions = {
  FADE: 'fade',
  SCALE: 'scale',
  SLIDE_RIGHT: 'slide_right',
  SLIDE_LEFT: 'slide_left',
  SLIDE_TOP: 'slide_top',
  SLIDE_BOTTOM: 'slide_bottom',
} as const;
export type Transition = (typeof transitions)[keyof typeof transitions];
