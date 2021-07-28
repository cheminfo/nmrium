export const CURRENT_EXPORT_VERSION = 1;

export default function migrateData(data: any): any {
  if (!data?.version) {
    return migrateToVersion1(data);
  }

  return data;
}

function migrateToVersion1(data: any): any {
  const newData = { ...data };
  const changedKeys = {
    j: 'js',
    signal: 'signals',
    integral: 'integration',
    peak: 'peaks',
  };

  function changeKeys(data) {
    return JSON.parse(JSON.stringify(data), function (key, value) {
      if (key in changedKeys) {
        this[changedKeys[key]] = value;
        return;
      }
      return value;
    });
  }

  for (const spectrum of newData.spectra) {
    if (spectrum.ranges) {
      spectrum.ranges = changeKeys(spectrum.ranges);
    } else if (spectrum.zones) {
      spectrum.zones = changeKeys(spectrum.zones);
    }
  }

  return newData;
}
