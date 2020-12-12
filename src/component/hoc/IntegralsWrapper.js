import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

function IntegralsWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      activeTab,
      tabActiveSpectrum,
      molecules,
    } = useChartData();
    const preferences = usePreferences();

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
