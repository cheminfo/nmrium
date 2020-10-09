import { zoomDefaultValues } from '../../reducer/helper/Spectrum1DZoomHelper';

const initSetting = {
  controllers: {
    mws: { low: zoomDefaultValues.lowStep, high: zoomDefaultValues.highStep },
  },
};

export default initSetting;
