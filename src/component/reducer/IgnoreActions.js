import * as types from './types/Types';

const ignoreActions = [
  types.APPLY_KEY_PREFERENCES,
  types.BRUSH_END,
  types.EXPORT_DATA,
  types.RESET_DOMAIN,
  types.RESET_SELECTED_TOOL,
  types.SET_KEY_PREFERENCES,
  types.SET_LOADING_FLAG,
  types.SET_ORIGINAL_DOMAIN,
  types.SET_SELECTED_FILTER,
  types.SET_SELECTED_OPTIONS_PANEL,
  types.SET_SELECTED_TOOL,
  types.SET_SPECTRUMS_VERTICAL_ALIGN,
  types.SET_VERTICAL_INDICATOR_X_POSITION,
  types.SET_WIDTH,
  types.SET_X_DOMAIN,
  types.SET_Y_DOMAIN,
  types.SET_ZOOM_FACTOR,
  types.TOGGLE_REAL_IMAGINARY_VISIBILITY,
  types.CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  types.CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  types.FULL_ZOOM_OUT,
  types.SAVE_AS_SVG,
  types.SAVE_DATA_AS_JSON,
  types.SET_ACTIVE_TAB,
  types.CHANGE_VISIBILITY,
  types.CHANGE_PEAKS_MARKERS_VISIBILITY,
  types.CHANGE_ACTIVE_SPECTRUM,
  types.CHANGE_INTEGRAL_ZOOM,
  types.CHANGE_SPECTRUM_COLOR,
  types.UPDATE_CORRELATIONS,
  types.SET_CORRELATION_MF,
  types.SET_CORRELATION_TOLERANCE,
];

function checkActionType(type) {
  if (!ignoreActions.includes(type)) return true;
  return false;
}

export default checkActionType;
