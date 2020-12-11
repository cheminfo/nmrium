import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

function IntegralsWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      preferences,
      activeTab,
      tabActiveSpectrum,
      molecules,
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

    const nucleus = useMemo(() => {
      if (tabActiveSpectrum && Object.keys(tabActiveSpectrum).length > 0) {
        return Object.keys(tabActiveSpectrum);
      }
      return null;
    }, [tabActiveSpectrum]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        integrals={integrals}
        info={info}
        xDomain={xDomain}
        preferences={preferences}
        activeTab={activeTab}
        nucleus={nucleus}
        molecules={molecules}
        ref={forwardedRef}
      />
    );
  };

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default IntegralsWrapper;
