import { Zone } from 'nmr-processing';
import { useMemo } from 'react';

export interface ZoneData extends Zone {
  tableMetaInfo: {
    id: number;
    signalIndex: number;
    rowSpan: any;
    signal: {
      kind: any;
    };
    experiment: string;
  };
}

export function useMapZones(
  data,
  info: { experiment: string; nuclei: string[] },
): ZoneData[] {
  return useMemo(() => {
    const zonesData: ZoneData[] = [];
    if (!data) return [];

    for (const [i, zone] of data.entries()) {
      if (zone.signals.length === 1) {
        zonesData.push({
          ...zone,
          tableMetaInfo: {
            ...zone.tableMetaInfo,
            signal: zone.signals[0],
            rowIndex: i,
            signalIndex: 0,
            id: zone.signals[0].id,
            ...info,
          },
        });
      } else if (zone.signals.length > 1) {
        for (const [j, signal] of zone.signals.entries()) {
          let hide = false;
          let rowSpan: number | null = null;
          if (j < zone.signals.length - 1) {
            if (j === 0) {
              rowSpan = zone.signals.length;
            } else {
              hide = true;
            }
          } else {
            hide = true;
          }
          zonesData.push({
            ...zone,
            tableMetaInfo: {
              ...zone.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: signal.id,
              experiment: info.experiment,
            },
          });
        }
      }
    }

    return zonesData;
  }, [data, info]);
}
