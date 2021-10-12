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
};

export const types = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  PROGRESS_INDICATOR: 'progress_indicator',
};

export const transitions = {
  FADE: 'fade',
  SCALE: 'scale',
  SLIDE_RIGHT: 'slide_right',
  SLIDE_LEFT: 'slide_left',
  SLIDE_TOP: 'slide_top',
  SLIDE_BOTTOM: 'slide_bottom',
};

export const transitionStyles: any = {
  [transitions.FADE]: {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
  },
  [transitions.SCALE]: {
    entering: { transform: 'scale(0)' },
    entered: { transform: 'scale(1)' },
    exiting: { transform: 'scale(0)' },
    exited: { transform: 'scale(0)' },
  },
};
