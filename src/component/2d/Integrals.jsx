import React, { useMemo, useCallback } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_2D_INTEGRAL } from '../reducer/types/Types';

import Zone from './Zone';

const Integrals = () => {
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
      dispatch({ type: DELETE_2D_INTEGRAL, id });
    },
    [dispatch],
  );

  return (
    <g clipPath="url(#clip)" className="2D-Integrals">
      {_data.map((d) => (
        <g key={d.id}>
          {d.integrals.values.map((integral) => (
            <Zone key={integral.id} {...integral} onDelete={deleteHandler} />
          ))}
        </g>
      ))}
    </g>
  );
};

export default Integrals;
