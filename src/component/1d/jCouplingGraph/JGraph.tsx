import { scaleLinear } from 'd3';
import { memo, useMemo } from 'react';

import generateJGraphData, {
  CouplingLink,
} from '../../../data/data1d/Spectrum1D/generateJGraphData';
import { Signal1D } from '../../../data/types/data1d';
import { Datum1D } from '../../../data/types/data1d/Datum1D';
import { useChartData } from '../../context/ChartContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { rangeStateInit } from '../../reducer/Reducer';

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

const MemoizedJGraph = memo(InnerJGraph);

export default function JGraph() {
  const {
    height,
    view: {
      ranges: rangeState,
      spectra: { activeTab },
    },
  } = useChartData();
  const spectrum = useSpectrum() as Datum1D;

  const { showJGraph } =
    rangeState.find((r) => r.spectrumID === spectrum?.id) || rangeStateInit;

  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const graphHeight = height / 4;

  const {
    signals,
    jCouplingMax: maxValue,
    links,
  } = useMemo(
    () =>
      generateJGraphData(
        spectrum?.ranges.values,
        rangesPreferences.jGraphTolerance,
      ) || {
        signals: [],
        jCouplingMax: 0,
        links: [],
      },
    [rangesPreferences.jGraphTolerance, spectrum?.ranges.values],
  );

  const scaleY = useMemo(() => {
    const maxRange = maxValue + maxValue * 0.1;
    return scaleLinear().range([graphHeight, 0]).domain([0, maxRange]);
  }, [graphHeight, maxValue]);

  const JGraphState = useMemo(() => {
    return { scaleY, height: graphHeight, maxValue };
  }, [graphHeight, scaleY, maxValue]);

  if (!showJGraph || !spectrum?.display?.isVisible) return null;

  return (
    <JGraphContextProvider value={JGraphState}>
      <MemoizedJGraph signals={signals} links={links} />
    </JGraphContextProvider>
  );
}
