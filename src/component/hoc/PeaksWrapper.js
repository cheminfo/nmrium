import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

function PeaksWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data: spectra,
      activeSpectrum,
      xDomain,
      activeTab,
      tabActiveSpectrum,
    } = useChartData();
    const preferences = usePreferences();

    const { peaks = {}, info = {}, data = {} } = useMemo(() => {
      if (spectra && activeSpectrum && activeSpectrum.id) {
        const datum = spectra.find(
          (datum) => datum.id === activeSpectrum.id,
        ) || {
          peaks: {},
          info: {},
          data: {},
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, spectra]);

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
        peaks={peaks}
        info={info}
        x={data.x}
        y={data.y}
        xDomain={xDomain}
        preferences={preferences}
        activeTab={activeTab}
        nucleus={nucleus}
        ref={forwardedRef}
      />
    );
  };
  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default PeaksWrapper;
