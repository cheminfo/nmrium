import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

function IntegralsWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      preferences,
      activeTab,
    } = useChartData();

    const { integrals = {}, info = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { integrals, info } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { integrals, info };
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        integrals={integrals}
        info={info}
        xDomain={xDomain}
        preferences={preferences}
        activeTab={activeTab}
        ref={forwardedRef}
      />
    );
  };

  return React.forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default IntegralsWrapper;
