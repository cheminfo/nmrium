import { getLocalStorage, getValue } from '../../utility/LocalStorage';

export default class Spectrum1DZoomHelper {
  constructor(
    scale = 1,
    options = {
      slowZoomStep: 2,
      fastZoomStep: 8,
      speedThreshold: 3,
    },
  ) {
    this.scale = scale;
    this.speedThreshold = options.speedThreshold;
    this.slowZoomStep = options.slowZoomStep;
    this.fastZoomStep = options.fastZoomStep;
  }

  // eslint-disable-next-line no-unused-vars
  wheel(deltaY, deltaMode) {
    const deltaYValue =
      Math.abs(deltaY).toString().length === 1
        ? Math.abs(deltaY)
        : Math.abs(deltaY) / 100;
    const settings = getLocalStorage('settings');

    const _slowZoomStep = getValue(settings, 'controllers.mws.low');
    const _fastZoomStep = getValue(settings, 'controllers.mws.high');

    const LOW_STEP = _slowZoomStep
      ? 0.01 * _slowZoomStep
      : 0.01 * this.slowZoomStep;
    const FAST_STEP = _fastZoomStep
      ? 0.05 * _fastZoomStep
      : 0.05 * this.fastZoomStep;

    let ZOOM_STEP = deltaYValue <= this.speedThreshold ? LOW_STEP : FAST_STEP;
    // let ZOOM_STEP =
    //   deltaMode === 1
    //     ? deltaYValue <= this.speedThreshold
    //       ?  this.slowZoomStep * deltaMode
    //       : this.fastZoomStep * deltaMode
    //     : deltaMode
    //     ? 1
    //     : deltaYValue <= this.speedThreshold
    //     ? this.slowZoomStep
    //     : this.fastZoomStep * deltaYValue;

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
