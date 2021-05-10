import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

export default function FiltersWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { data, activeSpectrum } = useChartData();

    const { filters = [] } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          filters: [],
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, data]);
    const { forwardedRef, ...rest } = props;
    return <WrappedComponent {...rest} filters={filters} ref={forwardedRef} />;
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
