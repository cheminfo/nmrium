import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

function FiltersWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const { data, activeSpectrum } = useChartData();

    const { filters = [] } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { filters } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { filters };
      }
      return {};
    }, [activeSpectrum, data]);
    // const { filters = [] } = useMemo(() => {
    //   return spectrum || {};
    // }, [spectrum]);
    const { forwardedRef, ...rest } = props;
    return <WrappedComponent {...rest} filters={filters} ref={forwardedRef} />;
  };

  return React.forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default FiltersWrapper;
