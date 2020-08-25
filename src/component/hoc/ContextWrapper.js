import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

function ContextWrapper(WrappedComponent, ...keys) {
  const Wrapper = (props) => {
    const {
      data,
      activeSpectrum,
      preferences,
      activeTab,
      selectedTool,
      xDomain,
      yDomain,
      tabActiveSpectrum,
      molecules,
      showMultiplicityTrees,
      displayerMode,
    } = useChartData();

    const spectrumData = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const spectrum = data.find((datum) => datum.id === activeSpectrum.id);
        if (!keys) {
          return spectrum;
        } else if (keys.length === 1) {
          return spectrum[keys[0]];
        } else {
          return keys.reduce(
            (acc, key) => ({ ...acc, [key]: spectrum[key] }),
            {},
          );
        }
      }
      return null;
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
        data={spectrumData}
        preferences={preferences}
        activeTab={activeTab}
        selectedTool={selectedTool}
        xDomain={xDomain}
        yDomain={yDomain}
        nucleus={nucleus}
        {...rest}
        ref={forwardedRef}
        molecules={molecules}
        showMultiplicityTrees={showMultiplicityTrees}
        displayerMode={displayerMode}
      />
    );
  };

  return React.forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default ContextWrapper;
