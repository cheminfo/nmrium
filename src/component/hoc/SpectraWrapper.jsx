import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function SpectraWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { data, activeSpectrum, activeTab, displayerMode } = useChartData();

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        data={data}
        activeSpectrum={activeSpectrum}
        activeTab={activeTab}
        displayerMode={displayerMode}
        ref={forwardedRef}
      />
    );
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
