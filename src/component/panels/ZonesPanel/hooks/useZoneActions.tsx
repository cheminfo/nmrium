import { useDispatch } from '../../../context/DispatchContext.js';

import type { ZoneData } from './useMapZones.js';

function getZoomDomain(zone: ZoneData, marginFactor = 10) {
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo },
  } = zone;
  const xMargin = Math.abs(xFrom - xTo) * marginFactor;
  const yMargin = Math.abs(yFrom - yTo) * marginFactor;

  const xDomain: [number, number] =
    xFrom <= xTo
      ? [xFrom - xMargin, xTo + xMargin]
      : [xTo - xMargin, xFrom + xMargin];

  const yDomain: [number, number] =
    yFrom <= yTo
      ? [yFrom - yMargin, yTo + yMargin]
      : [yTo - yMargin, yFrom + yMargin];

  return { xDomain, yDomain };
}

export function useZoneActions() {
  const dispatch = useDispatch();
  function zoomToZone(zone: ZoneData) {
    const { xDomain, yDomain } = getZoomDomain(zone);
    dispatch({
      type: 'SET_X_DOMAIN',
      payload: {
        xDomain,
      },
    });
    dispatch({
      type: 'SET_Y_DOMAIN',
      payload: {
        yDomain,
      },
    });
  }

  function saveZone(zone: ZoneData) {
    dispatch({
      type: 'SAVE_EDITED_ZONE',
      payload: {
        zone,
      },
    });
  }

  return { zoomToZone, saveZone };
}
