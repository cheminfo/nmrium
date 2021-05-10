import { useMemo, memo, forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

export default function MoleculeWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      data,
      activeSpectrum,
      molecules,
      displayerMode,
      activeTab,
    } = useChartData();

    const { ranges = {}, zones = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          ranges: {},
          zones: {},
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        ranges={ranges}
        zones={zones}
        molecules={molecules}
        displayerMode={displayerMode}
        activeTab={activeTab}
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
