import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function MultiAnalysisWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { activeTab, spectraAnalysis, displayerKey } = useChartData();
    const { forwardedRef, ...rest } = props;

    return (
      <WrappedComponent
        {...rest}
        activeTab={activeTab}
        spectraAnalysis={spectraAnalysis}
        displayerKey={displayerKey}
        ref={forwardedRef}
      />
    );
  }
  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
