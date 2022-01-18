import { changeKeys } from './changeKeys';

/*
    * changes from version 1 to version 2:
           1- peaks :
                delta => x , originDelta => originalX, intensity => y,
               paths:
               - peak

           2- range/signals :
                atomIDs => atoms , intensity => y,

              paths:
               - range > signals
               - range > signals > js
               - range > signals > peaks

           3- zone/signals :
              we have two cases the
              a)
                get out the inner object fromTo:{from,to} => {from,to}
              paths:
               - zone > signals > x
               - zone > signals > y
              b)
                { fromTo,deltaX,resolutionX,nucleusX,deltaY,resolutionY,nucleusY,shiftX,shiftY} =>
                {
                  x: {
                    from: fromTo[0].from,
                    to: fromTo[0].to,
                    delta: deltaX,
                    resolution: resolutionX,
                    nucleus: nucleusX,
                  },
                  y: {
                    from: fromTo[1].from,
                    to: fromTo[1].to,
                    delta: deltaY,
                    resolution: resolutionY,
                    nucleus: nucleusY,
                  },
                  }

                paths:
                -zone>signals
    */

export default function migrateToVersion2(data: any): any {
  if (data?.version === 2) return data;

  const newData = { ...data, version: 2 };

  const changedKeys = {
    peaks: {
      delta: 'x',
      originDelta: 'originalX',
      intensity: 'y',
    },
    ranges: {
      atomIDs: 'atoms', // signal
      intensity: 'y', // signal > peaks
    },
  };

  for (const spectrum of newData.spectra) {
    if (spectrum.peaks) {
      spectrum.peaks = changeKeys(spectrum.peaks, changedKeys.peaks);
    } else if (spectrum.ranges) {
      spectrum.ranges = changeKeys(spectrum.ranges, changedKeys.ranges);
    } else if (spectrum.zones) {
      spectrum.zones.values = mapZones(spectrum.zones.values);
    }
  }

  return newData;
}

function mapZones(zones) {
  return zones.map((zone) => {
    if (zone.signals) {
      zone.signals = zone.signals.map((signal) => {
        if (signal.x && signal.y) {
          const {
            x: { fromTo: fromToX, ...resX },
            y: { fromTo: fromToY, ...resY },
          } = signal;
          signal = {
            ...signal,
            x: { ...resX, ...fromToX },
            y: { ...resY, ...fromToY },
          };
        } else {
          const {
            fromTo,
            deltaX,
            resolutionX,
            nucleusX,
            deltaY,
            resolutionY,
            nucleusY,

            shiftX,
            shiftY,
            ...resSignal
          } = signal;
          signal = {
            ...resSignal,
            x: {
              from: fromTo[0].from,
              to: fromTo[0].to,
              delta: deltaX,
              resolution: resolutionX,
              nucleus: nucleusX,
            },
            y: {
              from: fromTo[1].from,
              to: fromTo[1].to,
              delta: deltaY,
              resolution: resolutionY,
              nucleus: nucleusY,
            },
          };
        }
        return signal;
      }, []);
    }
    return zone;
  }, []);
}
