export default class Spectrum1DZoomHelper {
  constructor(
    scale = 1,
    options = {
      slowZoomStep: 0.01,
      fastZoomStep: 0.05,
      speedThreshold: 3,
    },
  ) {
    this.scale = scale;
    this.slowZoomStep = options.slowZoomStep;
    this.fastZoomStep = options.fastZoomStep;
    this.speedThreshold = options.speedThreshold;
  }

  wheel(deltaY, deltaMode) {
    const deltaYValue =
      Math.abs(deltaY) === 1 ? Math.abs(deltaY) : Math.abs(deltaY) / 100;

    let ZOOM_STEP =
      deltaMode === 1
        ? deltaYValue <= this.speedThreshold
          ? this.slowZoomStep
          : this.fastZoomStep * deltaMode
        : deltaMode
        ? 1
        : deltaYValue <= this.speedThreshold
        ? this.slowZoomStep
        : this.fastZoomStep * deltaYValue;

    const direction = Math.sign(deltaY);
    const _scale =
      direction === -1 ? this.scale + ZOOM_STEP : this.scale - ZOOM_STEP;
    if (_scale >= 0 || _scale === 0) {
      this.scale = _scale;
    } else {
      this.scale = 0;
    }
  }

  getScale() {
    return this.scale;
  }

  setScale(scale) {
    this.scale = scale;
  }
}
