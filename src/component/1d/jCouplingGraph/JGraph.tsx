import React, { memo, useCallback, useContext, useMemo } from 'react';

import { Signal1D } from '../../../data/types/data1d';
import { Datum1D } from '../../../data/types/data1d/Datum1D';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import JsCoupling from './JsCoupling';
import JCouplingLinks from './JsCouplingLinks';
import generateJGraphData, { CouplingLinks } from './generateJGraphData';

interface innerJGraphProps {
  signals: Signal1D[];
  links: CouplingLinks;
}

const arrowSize = 10;
const marginTop = 40;

const JGraphContext = React.createContext<{
  scaleY: (value: number) => number;
  height: number;
}>({
  scaleY: (value) => value,
  height: 0,
});

const JGraphContextProvider = JGraphContext.Provider;

export function useJGraph() {
  return useContext(JGraphContext);
}

function InnerJGraph(props: innerJGraphProps) {
  const { signals, links } = props;
  return (
    <g className="j-graph" transform={`translate(0,${marginTop})`}>
      <JCouplingLinks links={links} />
      <JsCoupling signals={signals} />
    </g>
  );
}

const emptyData = { ranges: {} };
const MemoizedJGraph = memo(InnerJGraph);

export default function JGraph() {
  const {
    height,
    toolOptions: {
      data: { showJGraph },
    },
  } = useChartData();

  const graphHeight = height / 4;
  const { ranges } = useSpectrum(emptyData) as Datum1D;

  const { signals, jCouplingMax, links } = useMemo(
    () =>
      generateJGraphData(ranges.values) || {
        signals: [],
        jCouplingMax: 0,
        links: {},
      },
    [ranges.values],
  );

  const scaleY = useCallback(
    (value) => {
      return (
        graphHeight - ((graphHeight - arrowSize - 10) / jCouplingMax) * value
      );
    },
    [graphHeight, jCouplingMax],
  );

  const JGraphState = useMemo(() => {
    return { scaleY, height: graphHeight };
  }, [graphHeight, scaleY]);

  if (!showJGraph) return null;

  return (
    <JGraphContextProvider value={JGraphState}>
      <MemoizedJGraph signals={signals} links={links} />
    </JGraphContextProvider>
  );
}
