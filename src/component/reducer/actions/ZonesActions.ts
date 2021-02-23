import { Draft, original } from 'immer';

import {
  Datum2D,
  detectZones,
  detectZonesManual,
  changeZoneSignal as ChangeSignal,
} from '../../../data/data2d/Datum2D';
import Events from '../../utility/Events';
import { State } from '../Reducer';
import get2DRange from '../helper/get2DRange';

// eslint-disable-next-line import/order
import { handleUpdateCorrelations } from './CorrelationsActions';
// import { AnalysisObj } from '../core/Analysis';

import { setDomain } from './DomainActions';

let noiseFactor = 1;

Events.on('noiseFactorChanged', (val) => {
  noiseFactor = val;
});

function add2dZoneHandler(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const drawnZone = get2DRange(draft, action);
    detectZonesManual(draft.data[index], {
      selectedZone: drawnZone,
      thresholdFactor: noiseFactor,
      convolutionByFFT: false,
    });
    handleOnChangeZonesData(draft);
  }
}
function delete2dZoneHandler(draft: Draft<State>, zoneID) {
  const state = original(draft) as State;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    if (zoneID == null || zoneID === undefined) {
      (draft.data[index] as Datum2D).zones.values = [];
    } else {
      const zoneIndex = (state.data[index] as Datum2D).zones.values.findIndex(
        (p) => p.id === zoneID,
      );
      (draft.data[index] as Datum2D).zones.values.splice(zoneIndex, 1);
    }
    handleOnChangeZonesData(draft);
  }
}

function handleAutoZonesDetection(draft: Draft<State>, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    detectZones(draft.data[index], detectionOptions);
    handleOnChangeZonesData(draft);
  }
}

function handleChangeZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const zoneIndex = (state.data[index] as Datum2D).zones.values.findIndex(
      (p) => p.id === action.data.id,
    );
    (draft.data[index] as Datum2D).zones.values[zoneIndex] = action.data;
    handleOnChangeZonesData(draft);
  }
}

function changeZoneSignal(draft: Draft<State>, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    ChangeSignal(draft.data[index], zoneID, signal);
    setDomain(draft);
    handleOnChangeZonesData(draft);
  }
}

function handleOnChangeZonesData(draft) {
  handleUpdateCorrelations(draft);
}

export {
  add2dZoneHandler,
  delete2dZoneHandler,
  handleAutoZonesDetection,
  handleChangeZone,
  changeZoneSignal,
};
