import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

function MultiAnalysisWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const { activeTab, spectraAanalysis } = useChartData();
    const { forwardedRef, ...rest } = props;

    return (
      <WrappedComponent
        {...rest}
        activeTab={activeTab}
        spectraAanalysis={spectraAanalysis}
        ref={forwardedRef}
      />
    );
  };
  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default MultiAnalysisWrapper;
