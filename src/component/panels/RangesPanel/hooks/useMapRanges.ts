import { v4 } from '@lukeed/uuid';
import { Range } from 'nmr-processing';
import { useMemo } from 'react';

export interface RangeData extends Range {
  rowKey: string;
  tableMetaInfo: any;
}
//TODO need to refactor the ranges table

function useMapRanges(data) {
  return useMemo(() => {
    const rangesData: RangeData[] = [];
    for (const [i, range] of data.entries()) {
      if (!range?.signals || range?.signals?.length === 0) {
        rangesData.push({
          rowKey: v4(),
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            rowIndex: i,
          },
        });
      } else if (range.signals.length === 1) {
        const signal = range.signals[0];
        rangesData.push({
          rowKey: signal.id,
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            signal,
            rowIndex: i,
            signalIndex: 0,
            id: signal.id,
          },
        });
      } else if (range.signals.length > 1) {
        for (const [j, signal] of range.signals.entries()) {
          let hide = false;
          let rowSpan = null;
          if (j < range.signals.length - 1) {
            if (j === 0) {
              rowSpan = range.signals.length;
            } else {
              hide = true;
            }
          } else {
            hide = true;
          }

          rangesData.push({
            rowKey: v4(),
            ...range,
            tableMetaInfo: {
              ...range.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: signal.id,
            },
          });
        }
      }
    }

    return rangesData;
  }, [data]);
}

export default useMapRanges;
