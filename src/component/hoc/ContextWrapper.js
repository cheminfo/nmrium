import React, { useMemo, memo } from 'react';

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

    // const data = useMemo(() => {
    //   function getProp(key) {
    //     if (key === 'nucleus') {
    //       return { [key]: nucleus };
    //     } else if (key === 'spectrum') {
    //       return { [key]: spectrum };
    //     }
    //     return { [key]: chartData[key] };
    //   }
    //   return keysProps && Array.isArray(keysProps)
    //     ? keysProps.reduce((acc, key) => ({ ...acc, ...getProp(key) }), {})
    //     : {};
    // }, [chartData, nucleus, spectrum]);

    // const generalProps = useMemo(() => {
    //   console.log({ ...data });
    //   return data;
    // }, [data]);

    // const generalProps = useMemo(
    //   () => {
    //     function getProp(key) {
    //       if (key === 'nucleus') {
    //         return { [key]: nucleus };
    //       } else if (key === 'spectrum') {
    //         return { [key]: spectrum };
    //       }
    //       return { [key]:  eval('chartData.' + key) };
    //     }
    //     console.log(getProp());
    //     return keysProps && Array.isArray(keysProps)
    //       ? keysProps.reduce(
    //           (acc, key) => ({ ...acc, [key]: getProp(key) }),
    //           {},
    //         )
    //       : {};
    //   },
    //   () =>
    //     keysProps &&
    //     Array.isArray(keysProps) &&
    //     keysProps.map((key) => eval('chartData.' + key)),
    // );

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
    React.forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
export default ContextWrapper;
