import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

function PeaksWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      activeTab,
      tabActiveSpectrum,
    } = useChartData();
    const preferences = usePreferences();

    const { peaks = {}, info = {}, x = [], y = [] } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { peaks, info, x, y } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { peaks, info, x, y };
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
        peaks={peaks}
        info={info}
        x={x}
        y={y}
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
