import { Datum2D } from '../../../data/data2d/Datum2D';
import { get2DYScale, get2DXScale } from '../../2d/utilities/scale';
import Events from '../../utility/Events';
import { AnalysisObj } from '../core/Analysis';

import { setDomain } from './DomainActions';

let noiseFactor = 1;

Events.on('noiseFactorChanged', (val) => {
  noiseFactor = val;
});

function add2dZoneHandler(draft, action) {
  const { startX, startY, endX, endY } = action;
  const scaleX = get2DXScale(draft);
  const scaleY = get2DYScale(draft);
  const x1 = startX * 1000000 > endX * 1000000 ? endX : startX;
  const x2 = startX * 1000000 > endX * 1000000 ? startX : endX;
  const y1 = startY * 1000000 > endY * 1000000 ? endY : startY;
  const y2 = startY * 1000000 > endY * 1000000 ? startY : endY;

  const datumObject =
    draft.activeSpectrum && draft.activeSpectrum.id
      ? AnalysisObj.getDatum(draft.activeSpectrum.id)
      : null;
  if (datumObject && datumObject instanceof Datum2D) {
    const fromY = scaleY.invert(y1);
    const fromX = scaleX.invert(x1);
    const toY = scaleY.invert(y2);
    const toX = scaleX.invert(x2);
    const zone = datumObject.detectZonesManual({
      selectedZone: { fromX, fromY, toX, toY },
      thresholdFactor: noiseFactor,
      convolutionByFFT: false,
    });
    draft.data[draft.activeSpectrum.index].zones.values.push(zone);
  }
}
function delete2dZoneHandler(draft, zoneID) {
  if (draft.activeSpectrum && draft.activeSpectrum.id) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.deleteZone(zoneID);
    const zones = datumObject.getZones();
    draft.data[index].zones = zones;
  }
}

function handleAutoZonesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    const zones = datumObject.detectZones(detectionOptions);
    draft.data[index].zones = zones;
  }
}

function handleChangeZone(draft, action) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.setZone(action.data);
    draft.data[index].zones = datumObject.getZones();
  }
}
function changeZoneSignal(draft, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    if (datumObject instanceof Datum2D) {
      const zones = datumObject.changeZoneSignal(zoneID, signal);
      draft.data[index].zones = zones;
      draft.data = AnalysisObj.getSpectraData();
      setDomain(draft);
    }
  }
}

export {
  add2dZoneHandler,
  delete2dZoneHandler,
  handleAutoZonesDetection,
  handleChangeZone,
  changeZoneSignal,
};
