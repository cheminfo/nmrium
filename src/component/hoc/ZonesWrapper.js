import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

function ZonesWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      yDomain,
      activeTab,
      tabActiveSpectrum,
    } = useChartData();
    const preferences = usePreferences();

    const { zones = {}, info = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { zones, info } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { zones, info };
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
        zones={zones}
        info={info}
        xDomain={xDomain}
        yDomain={yDomain}
        preferences={preferences}
        activeTab={activeTab}
        nucleus={nucleus}
        ref={forwardedRef}
      />
    );
  };

  return memo(
    forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
export default ZonesWrapper;
