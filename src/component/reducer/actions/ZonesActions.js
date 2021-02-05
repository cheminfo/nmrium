import { original } from 'immer';

import { detectZones, detectZonesManual } from '../../../data/data2d/Datum2D';
import Events from '../../utility/Events';
import get2DRange from '../helper/get2DRange';
// import { AnalysisObj } from '../core/Analysis';

import { setDomain } from './DomainActions';

let noiseFactor = 1;

Events.on('noiseFactorChanged', (val) => {
  noiseFactor = val;
});

function add2dZoneHandler(draft, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const drawnZone = get2DRange(draft, action);
    detectZonesManual(draft.data[index], {
      selectedZone: drawnZone,
      thresholdFactor: noiseFactor,
      convolutionByFFT: false,
    });
  }
}
function delete2dZoneHandler(draft, zoneID) {
  const state = original(draft);
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    if ((zoneID == null) | (zoneID === undefined)) {
      draft.data[index].zones.values = [];
    } else {
      const zoneIndex = state.data[index].zones.values.findIndex(
        (p) => p.id === zoneID,
      );
      draft.data[index].zones.values.splice(zoneIndex, 1);
    }
  }
}

function handleAutoZonesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    detectZones(draft.data[index], detectionOptions);
  }
}

function handleChangeZone(draft, action) {
  const state = original(draft);
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const zoneIndex = state.data[index].zones.values.findIndex(
      (p) => p.id === action.data.id,
    );
    draft.data[index].zones.values[zoneIndex] = action.data;
  }
}

function changeZoneSignal(draft, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeZoneSignal(draft.data[index], zoneID, signal);
    setDomain(draft);
  }
}

export {
  add2dZoneHandler,
  delete2dZoneHandler,
  handleAutoZonesDetection,
  handleChangeZone,
  changeZoneSignal,
};
