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
    diaID: 'diaIDs',
  };

  function changeKeys(data) {
    return JSON.parse(JSON.stringify(data), function reviver(key, value) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function migrateToVersion2(data: any): any {
  const newData = { ...data };
  const changedKeys = {
    peaks: {
      delta: 'x',
      originDelta: 'originalX',
      intensity: 'y',
    },
    signals: {
      atomIDs: 'atoms', // signal
      intensity: 'y', // signal > peaks
    },
  };

  function changeKeys(data, setKey: string) {
    return JSON.parse(JSON.stringify(data), function reviver(key, value) {
      if (key in changedKeys[setKey]) {
        this[changedKeys[key]] = value;
        return;
      }
      return value;
    });
  }

  for (const spectrum of newData.spectra) {
    if (spectrum.peaks) {
      spectrum.peaks = changeKeys(spectrum.peaks, 'peaks');
    }
  }

  return newData;
}
