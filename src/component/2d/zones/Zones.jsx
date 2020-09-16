import React, { useMemo, useCallback } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { DELETE_2D_ZONE } from '../../reducer/types/Types';

import Peaks from './Peaks';
import Zone from './Zone';

const Zones = () => {
  const { data } = useChartData();
  const dispatch = useDispatch();
  const _data = useMemo(() => {
    return data
      ? data.filter(
          (d) => d.info.dimension === 2 && d.display.isVisible === true,
        )
      : [];
  }, [data]);

  const deleteHandler = useCallback(
    (id) => {
      dispatch({ type: DELETE_2D_ZONE, zoneID: id });
    },
    [dispatch],
  );

  return (
    <g clipPath="url(#clip)" className="2D-Zones">
      {_data.map((d) => (
        <g key={d.id}>
          {d.zones.values.map((zone) => (
            <>
              <Peaks signal={zone.signal} />
              <Zone key={zone.id} {...zone} onDelete={deleteHandler} />
            </>
          ))}
        </g>
      ))}
    </g>
  );
};

export default Zones;
