export default class Spectrum1DZoomHelper {
  static instance;

  static getInstance() {
    return Spectrum1DZoomHelper.instance;
  }

  constructor(
    scale = 1,
    options = {
      slowZoomStep: 0.01,
      fastZoomStep: 0.05,
      speedThreshold: 3,
    },
  ) {
    if (Spectrum1DZoomHelper.instance) {
      return Spectrum1DZoomHelper.instance;
    }

    Spectrum1DZoomHelper.instance = this;
    this.scale = scale;
    this.slowZoomStep = options.slowZoomStep;
    this.fastZoomStep = options.fastZoomStep;
    this.speedThreshold = options.speedThreshold;
  }

  isNegative(n) {
    return ((n = +n) || 1 / n) < 0;
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

    const direction = this.isNegative(deltaY) ? 'up' : 'down';
    let _scale = this.scale;

    if (direction === 'up') {
      _scale = this.scale + ZOOM_STEP;
    } else {
      _scale = this.scale - ZOOM_STEP;
    }
    if (_scale >= 0 || _scale === 0) {
      this.scale = _scale;
    } else {
      this.scale = _scale;
    }
  }

  getScale() {
    return this.scale;
  }
}
