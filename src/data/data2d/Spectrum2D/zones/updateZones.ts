import type { Spectrum2D } from 'nmr-processing';

import { mapZones } from './mapZones';

export function updateZones(spectrum: Spectrum2D) {
  spectrum.zones.values = mapZones(spectrum.zones.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
}
