import { v4 } from '@lukeed/uuid';
import { useMemo } from 'react';

import { Range } from '../../../../data/types/data1d';

export interface RangeData extends Range {
  rowKey: string;
  tableMetaInfo: any;
}

function useMapRanges(data) {
  return useMemo(() => {
    const _rangesData: Array<RangeData> = [];
    data.forEach((range, i) => {
      if (range.signals.length === 1) {
        _rangesData.push({
          rowKey: v4(),
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            signal: range.signals[0],
            rowIndex: i,
            signalIndex: 0,
            id: range.signals[0].id,
          },
        });
      } else if (range.signals.length > 1) {
        range.signals.forEach((signal, j) => {
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

          _rangesData.push({
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
        });
      }
    });

    return _rangesData;
  }, [data]);
}

export default useMapRanges;
