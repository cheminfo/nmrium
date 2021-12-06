import { changeKeys } from './changeKeys';

/**
 * changes from version 0 to version 1:
 * all change done on objects keys naming
 *  j         =>   js
 *  signal    =>   signals
 *  integral  =>   integration
 *  peak      =>   peaks
 *  diaID     =>   diaIDs
 *
 */

export default function migrateToVersion1(data: any): any {
  if (data?.version === 1) return data;

  const newData = { ...data, version: 1 };
  const changedKeys = {
    j: 'js',
    signal: 'signals',
    integral: 'integration',
    peak: 'peaks',
    diaID: 'diaIDs',
  };

  for (const spectrum of newData.spectra) {
    if (spectrum.ranges) {
      spectrum.ranges = changeKeys(spectrum.ranges, changedKeys);
    } else if (spectrum.zones) {
      spectrum.zones = changeKeys(spectrum.zones, changedKeys);
    }
  }

  return newData;
}
