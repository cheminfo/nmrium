import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';
import { useFormatNumberByNucleus } from '../utility/FormatNumber';

export default function EditModalRangeWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { data, activeSpectrum, activeTab } = useChartData();
    const format = useFormatNumberByNucleus(activeTab);

    const { info = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          info: {},
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        format={format}
        info={info}
        ref={forwardedRef}
      />
    );
  }

  return memo(
    forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
