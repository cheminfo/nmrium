import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

function RangesWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      activeTab,
      molecules,
      tabActiveSpectrum,
      displayerKey,
      selectedTool,
    } = useChartData();
    const preferences = usePreferences();

    const { ranges = {}, x = [], y = [], info = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          ranges: {},
          x: [],
          y: [],
          info: {},
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
        ranges={ranges}
        x={x}
        y={y}
        info={info}
        xDomain={xDomain}
        preferences={preferences}
        activeTab={activeTab}
        molecules={molecules}
        nucleus={nucleus}
        displayerKey={displayerKey}
        selectedTool={selectedTool}
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
export default RangesWrapper;
