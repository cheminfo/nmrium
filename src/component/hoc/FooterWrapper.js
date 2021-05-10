import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function FooterWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      margin,
      width,
      height,
      activeSpectrum,
      data,
      activeTab,
    } = useChartData();

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        data={data}
        activeSpectrum={activeSpectrum}
        activeTab={activeTab}
        margin={margin}
        width={width}
        height={height}
        ref={forwardedRef}
      />
    );
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
