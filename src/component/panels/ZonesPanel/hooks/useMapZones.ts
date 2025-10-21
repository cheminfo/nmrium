import type { Signal2D, Zone } from '@zakodium/nmr-types';
import { useMemo } from 'react';

import type { ZonesTableDataElement } from '../ZonesTable.js';

export interface ZoneData extends Zone {
  tableMetaInfo: {
    id: string;
    signalIndex: number;
    rowSpan: number | null;
    signal: Signal2D;
    hide: boolean;
    experiment: string;
  };
}

export function useMapZones(
  data: ZonesTableDataElement[],
  info: { experiment: string; nuclei: string[] },
): ZoneData[] {
  return useMemo(() => {
    const zonesData: ZoneData[] = [];
    if (!data) return [];

    for (const zone of data) {
      if (zone.signals.length === 1) {
        zonesData.push({
          ...zone,
          tableMetaInfo: {
            ...zone.tableMetaInfo,
            signal: zone.signals[0],
            signalIndex: 0,
            rowSpan: null,
            hide: false,
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
