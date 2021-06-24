import { memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function TempRangeWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      toolOptions: {
        data: { tempRange },
      },
    } = useChartData();

    const { forwardedRef, ...rest } = props;
    return <WrappedComponent {...rest} range={tempRange} ref={forwardedRef} />;
  }

  return memo(
    forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
