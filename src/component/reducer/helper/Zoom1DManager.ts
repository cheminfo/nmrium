import { getLocalStorage, getValue } from '../../utility/LocalStorage';

export interface Zoom1D {
  scales: { [key: string]: number };
  options: {
    slowZoomStep: number;
    fastZoomStep: number;
    speedThreshold: number;
  };
}

interface Zoom1DManager {
  scales: { [key: string]: number };
  wheel: (deltaY: number, id: string) => number;
  setScale: (newScale: number, id: string) => void;
  getScale: (id: string) => number;
}

interface ZoomOptions {
  factor?: number;
  invert?: boolean;
}
export function wheelZoom(
  event: WheelEvent,
  domain: number[],
  zoomOptions: ZoomOptions = {},
): number[] {
  const { factor = 1, invert = false } = zoomOptions;
  const [min, max] = domain;
  const delta = event.deltaY * (invert ? -0.001 : 0.001) * factor;
  const ratio = delta < 0 ? -1 / (delta - 1) : 1 + delta;
  return [min * ratio, max * ratio];
}

export function initZoom1D(): Zoom1D {
  const settings = getLocalStorage('nmr-general-settings');
  const _slowZoomStep = getValue(settings, 'general.controllers.mws.low');
  const _fastZoomStep = getValue(settings, 'general.controllers.mws.high');

  return {
    scales: {},
    options: {
      slowZoomStep: _slowZoomStep || 2,
      fastZoomStep: _fastZoomStep || 20,
      speedThreshold: 3,
    },
  };
}

export function setAllScales(Zoom1DObject: Zoom1D, newScale: number) {
  for (let spectrumID in Zoom1DObject.scales) {
    Zoom1DObject.scales[spectrumID] = newScale;
  }
}

export default function zoom1DManager(
  Zoom1DObject: Zoom1D,
  defaultScale = 1,
): Zoom1DManager {
  const wheel = prepareWheel(Zoom1DObject, defaultScale);
  const setScale = prepareSetScale(Zoom1DObject, defaultScale);
  const getScale = prepareGetScale(Zoom1DObject, defaultScale);

  return {
    scales: Zoom1DObject.scales,
    wheel,
    setScale,
    getScale,
  };
}

function initZoomManager(
  Zoom1DObject: Zoom1D,
  spectrumID: string,
  defaultScale: number,
) {
  if (Zoom1DObject.scales[spectrumID] === undefined) {
    Zoom1DObject.scales[spectrumID] = defaultScale;
  }
}

function prepareGetScale(Zoom1DObject: Zoom1D, defaultScale) {
  return (id: string) => {
    initZoomManager(Zoom1DObject, id, defaultScale);
    return Zoom1DObject.scales[id];
  };
}

function prepareSetScale(Zoom1DObject: Zoom1D, defaultScale: number) {
  return (newScale: number, spectrumID: string) => {
    initZoomManager(Zoom1DObject, spectrumID, defaultScale);
    Zoom1DObject.scales[spectrumID] = newScale;
  };
}

function prepareWheel(Zoom1DObject: Zoom1D, defaultScale: number) {
  return (deltaY: number, id: string) => {
    initZoomManager(Zoom1DObject, id, defaultScale);
    return wheel(Zoom1DObject, deltaY, id);
  };
}

function wheel(Zoom1DObject: Zoom1D, deltaY: number, id: string) {
  const {
    options: { slowZoomStep, fastZoomStep, speedThreshold },
  } = Zoom1DObject;

  const deltaYValue =
    Math.abs(deltaY).toString().length === 1
      ? Math.abs(deltaY)
      : Math.abs(deltaY) / 100;

  const LOW_STEP = 0.01 * slowZoomStep;
  const FAST_STEP = 0.05 * fastZoomStep;

  let ZOOM_STEP = deltaYValue <= speedThreshold ? LOW_STEP : FAST_STEP;

  const direction = Math.sign(deltaY);
  const _scale =
    direction === -1
      ? Zoom1DObject.scales[id] + ZOOM_STEP
      : Zoom1DObject.scales[id] - ZOOM_STEP;
  if (_scale >= 0) {
    Zoom1DObject.scales[id] = _scale;
  } else {
    Zoom1DObject.scales[id] = 0;
  }
  return Zoom1DObject.scales[id];
}
