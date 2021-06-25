import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import nucluesToString from '../utility/nucluesToString';

export default function FiltersWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      data,
      activeSpectrum,
      activeTab,
      toolOptions: {
        selectedTool,
        data: { activeFilterID = null },
      },
    } = useChartData();

    const spectraPerTab = useMemo(() => {
      const spectra =
        data &&
        data.filter(
          (spectrum) => activeTab === nucluesToString(spectrum.info.nucleus),
        );
      return spectra;
    }, [activeTab, data]);

    const { filters = [] } = useMemo(() => {
      if (spectraPerTab && activeSpectrum && activeSpectrum.id) {
        const datum = spectraPerTab.find(
          (datum) => datum.id === activeSpectrum.id,
        ) || {
          filters: [],
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, spectraPerTab]);
    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        filters={filters}
        spectraCounter={spectraPerTab && spectraPerTab.length}
        selectedTool={selectedTool}
        activeFilterID={activeFilterID}
        ref={forwardedRef}
      />
    );
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
