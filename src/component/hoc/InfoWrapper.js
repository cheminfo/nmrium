import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

function InfoWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const { data, activeSpectrum } = useChartData();

    const { info = {}, meta = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { info, meta } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { info, meta };
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent {...rest} info={info} meta={meta} ref={forwardedRef} />
    );
  };

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default InfoWrapper;
