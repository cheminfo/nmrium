import { useMemo } from 'react';

import { buildID } from '../../../data/utilities/Concatenation';

function useMapRanges(data) {
  return useMemo(() => {
    const _rangesData = [];
    data.forEach((range, i) => {
      if (range.signal.length === 1) {
        _rangesData.push({
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            signal: range.signal[0],
            rowIndex: i,
            signalIndex: 0,
            id: buildID(range.id, 0),
          },
        });
      } else if (range.signal.length > 1) {
        range.signal.forEach((signal, j) => {
          let hide = false;
          let rowSpan = null;
          if (j < range.signal.length - 1) {
            if (j === 0) {
              rowSpan = range.signal.length;
            } else {
              hide = true;
            }
          } else {
            hide = true;
          }

          _rangesData.push({
            ...range,
            tableMetaInfo: {
              ...range.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: buildID(range.id, j),
            },
          });
        });
      }
    });

    return _rangesData;
  }, [data]);
}

export default useMapRanges;
