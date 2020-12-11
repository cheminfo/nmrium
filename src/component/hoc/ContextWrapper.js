import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

function ContextWrapper(WrappedComponent, subKeys) {
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

    const spectrum = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const spectrum = data.find((datum) => datum.id === activeSpectrum.id);
        if (subKeys === undefined || !subKeys.spectrum) {
          return spectrum;
        } else if (subKeys.spectrum.length === 1) {
          return spectrum[subKeys.spectrum[0]];
        } else {
          return subKeys.spectrum.reduce(
            (acc, key) => ({ ...acc, [key]: spectrum[key] }),
            {},
          );
        }
      }
      return undefined;
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
        data={data}
        spectrum={spectrum}
        nucleus={nucleus}
        activeSpectrum={activeSpectrum}
        preferences={preferences}
        activeTab={activeTab}
        selectedTool={selectedTool}
        xDomain={xDomain}
        yDomain={yDomain}
        tabActiveSpectrum={tabActiveSpectrum}
        molecules={molecules}
        showMultiplicityTrees={showMultiplicityTrees}
        displayerMode={displayerMode}
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
export default ContextWrapper;
