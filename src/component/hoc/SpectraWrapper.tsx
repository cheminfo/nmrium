import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

interface WrapperProps {
  onTabChange?: (element: any) => void;
  data?: any;
  activeSpectrum?: string;
  activeTab?: string;
  forwardedRef?: any;
  spectrums?: any;
}

export default function SpectraWrapper(WrappedComponent) {
  function Wrapper(props: WrapperProps) {
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

  return forwardRef((props: WrapperProps, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
