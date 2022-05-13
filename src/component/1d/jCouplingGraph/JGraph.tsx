import { scaleLinear } from 'd3';
import lodashGet from 'lodash/get';
import { memo, useMemo } from 'react';

import generateJGraphData, {
  CouplingLink,
} from '../../../data/data1d/Spectrum1D/generateJGraphData';
import { Signal1D } from '../../../data/types/data1d';
import { Datum1D } from '../../../data/types/data1d/Datum1D';
import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import useSpectrum from '../../hooks/useSpectrum';
import { getRangeDefaultValues } from '../../reducer/preferences/panelsPreferencesDefaultValues';

import { JGraphContextProvider } from './JGraphContext';
import { JGraphVerticalAxis } from './JGraphVerticalAxis';
import JCouplingLinks from './JsCouplingLinks';
import JsCouplings from './JsCouplings';

const marginTop = 50;

interface innerJGraphProps {
  signals: Signal1D[];
  links: CouplingLink[];
}

function InnerJGraph(props: innerJGraphProps) {
  const { signals, links } = props;
  return (
    <g className="j-graph" transform={`translate(0,${marginTop})`}>
      <JGraphVerticalAxis />
      <JCouplingLinks links={links} />
      <JsCouplings signals={signals} />
    </g>
  );
}

const emptyData = { ranges: {} };
const MemoizedJGraph = memo(InnerJGraph);

export default function JGraph() {
  const preferences = usePreferences();

  const {
    height,
    toolOptions: {
      data: { showJGraph },
    },
    activeTab,
  } = useChartData();

  const graphHeight = height / 4;

  const { ranges } = useSpectrum(emptyData) as Datum1D;

  const jGraphTolerance = useMemo(() => {
    const _preferences =
      lodashGet(
        preferences.current,
        `formatting.panels.ranges.[${activeTab}]`,
      ) || getRangeDefaultValues(activeTab);

    return _preferences.jGraphTolerance;
  }, [activeTab, preferences]);

  const {
    signals,
    jCouplingMax: maxValue,
    links,
  } = useMemo(
    () =>
      generateJGraphData(ranges.values, jGraphTolerance) || {
        signals: [],
        jCouplingMax: 0,
        links: [],
      },
    [jGraphTolerance, ranges.values],
  );

  const scaleY = useMemo(() => {
    const maxRange = maxValue + maxValue * 0.1;
    return scaleLinear().range([graphHeight, 0]).domain([0, maxRange]);
  }, [graphHeight, maxValue]);

  const JGraphState = useMemo(() => {
    return { scaleY, height: graphHeight, maxValue };
  }, [graphHeight, scaleY, maxValue]);

  if (!showJGraph) return null;

  return (
    <JGraphContextProvider value={JGraphState}>
      <MemoizedJGraph signals={signals} links={links} />
    </JGraphContextProvider>
  );
}
