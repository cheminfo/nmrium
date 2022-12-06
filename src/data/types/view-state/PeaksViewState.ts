export interface PeaksViewState {
  /**
   * boolean indicator to hide/show peaks for spectrum
   * @default true
   */
  isPeaksVisible: boolean;
  /**
   * boolean indicator to hide/show peaks for shapes spectrum
   * @default false
   */
  showPeaksShapes: boolean;
  /**
   * boolean indicator to hide/show peaks sum for spectrum
   * @default false
   */
  showPeaksSum: boolean;
}
