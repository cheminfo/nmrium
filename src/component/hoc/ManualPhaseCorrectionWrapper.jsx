import { forwardRef, useMemo } from 'react';

import { Filters } from '../../data/Filters';
import { useChartData } from '../context/ChartContext';

export default function ManualPhaseCorrectionWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      data,
      activeSpectrum,
      toolOptions: {
        data: { pivot },
      },
    } = useChartData();

    const { datum = {}, filter = null } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const spectrum = data.find((datum) => datum.id === activeSpectrum.id);
        const filter =
          spectrum.filters.find(
            (filter) => filter.name === Filters.phaseCorrection.id,
          ) || null;
        return { datum: spectrum.data, filter };
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        datum={datum}
        filter={filter}
        pivot={pivot}
        ref={forwardedRef}
      />
    );
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
