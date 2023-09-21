import { Spectrum2D } from 'nmr-load-save';
import { mapZones } from 'nmr-processing';

export function updateZones(spectrum: Spectrum2D) {
  spectrum.zones.values = mapZones(spectrum.zones.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
}
