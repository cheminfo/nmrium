import React, { useMemo, memo } from 'react';

import { useChartData } from '../context/ChartContext';

function RangesWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      xDomain,
      preferences,
      activeTab,
      molecules,
      showMultiplicityTrees,
      tabActiveSpectrum,
    } = useChartData();

    const { ranges = {}, x = [], y = [] } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const { ranges, x, y } = data.find(
          (datum) => datum.id === activeSpectrum.id,
        );
        return { ranges, x, y };
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
        xDomain={xDomain}
        preferences={preferences}
        activeTab={activeTab}
        molecules={molecules}
        nucleus={nucleus}
        showMultiplicityTrees={showMultiplicityTrees}
        ref={forwardedRef}
      />
    );
  };

  return memo(
    React.forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
export default RangesWrapper;
