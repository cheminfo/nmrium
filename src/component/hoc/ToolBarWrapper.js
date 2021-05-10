import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function ToolBarWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      data,
      activeSpectrum,
      verticalAlign,
      displayerMode,
    } = useChartData();

    const { info = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const result = data.find((datum) => datum.id === activeSpectrum.id);
        return result !== null && result !== undefined
          ? { info: result.info, spectrumsCount: result.length }
          : {};
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        info={info}
        activeSpectrum={activeSpectrum}
        verticalAlign={verticalAlign}
        displayerMode={displayerMode}
        ref={forwardedRef}
      />
    );
  }

  return memo(
    forwardRef((props, ref) => {
      return <Wrapper {...props} forwardedRef={ref} />;
    }),
  );
}
