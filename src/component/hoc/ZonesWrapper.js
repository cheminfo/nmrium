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
      displayerKey,
    } = useChartData();
    const preferences = usePreferences();

    const {
      zones = {},
      info = {},
      display = {},
    } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          zones: {},
          info: {},
          display: {},
        };
        return datum;
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
        display={display}
        info={info}
        xDomain={xDomain}
        yDomain={yDomain}
        preferences={preferences}
        activeTab={activeTab}
        nucleus={nucleus}
        displayerKey={displayerKey}
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
