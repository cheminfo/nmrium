import { produce } from 'immer';

import { Datum2D } from '../../../data/data2d/Datum2D';
import { get2DYScale, get2DXScale } from '../../2d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

const add2dZoneHandler = (state, action) => {
  return produce(state, (draft) => {
    const { startX, startY, endX, endY } = action;
    // const { width, height, margin, xDomain, yDomain } = state;
    const scaleX = get2DXScale(state);
    const scaleY = get2DYScale(state);
    const x1 = startX * 1000000 > endX * 1000000 ? endX : startX;
    const x2 = startX * 1000000 > endX * 1000000 ? startX : endX;
    const y1 = startY * 1000000 > endY * 1000000 ? endY : startY;
    const y2 = startY * 1000000 > endY * 1000000 ? startY : endY;

    const datumObject =
      state.activeSpectrum && state.activeSpectrum.id
        ? AnalysisObj.getDatum(state.activeSpectrum.id)
        : null;
    if (datumObject && datumObject instanceof Datum2D) {
      const fromY = scaleY.invert(y1);
      const fromX = scaleX.invert(x1);
      const toY = scaleY.invert(y2);
      const toX = scaleX.invert(x2);
      datumObject.addZone({ fromX, toX, fromY, toY });
      const zones = datumObject.getZones();
      draft.data[state.activeSpectrum.index].zones = zones;
    }
  });
};
// eslint-disable-next-line no-unused-vars
const delete2dZoneHandler = (state, zoneID) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum && state.activeSpectrum.id) {
      const datumObject = AnalysisObj.getDatum(state.activeSpectrum.id);
      datumObject.deleteZone(zoneID);
      const zones = datumObject.getZones();
      draft.data[state.activeSpectrum.index].zones = zones;
    }
  });
};

const handleAutoZonesDetection = (state, detectionOptions) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      const zones = datumObject.detectZones(detectionOptions);
      draft.data[index].zones = zones;
    }
  });
};

export { add2dZoneHandler, delete2dZoneHandler, handleAutoZonesDetection };
