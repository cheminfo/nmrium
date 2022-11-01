import { memo, useMemo } from 'react';

import PlotChart from './PlotChart';
import { processSnapPlot } from './processSnapPlot';

interface Spectrum2DHistogramProps {
  color?: string;
  data: any;
}

const yLogBase = 2;

function Spectrum2DHistogram({
  color = 'red',
  data,
}: Spectrum2DHistogramProps) {
  const processedData = useMemo(() => {
    return processSnapPlot('2D', data.rr, yLogBase);
  }, [data]);

  return (
    <div>
      <div style={{ textAlign: 'center', paddingBottom: 5, paddingTop: 5 }}>
        San Plot
      </div>

      <div
        style={{
          borderTop: '1px solid #ededed',
          marginTop: '10px',
          paddingTop: '10px',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <PlotChart
          data={processedData}
          sign="positive"
          color={color}
          yLogBase={yLogBase}
        />
        <PlotChart
          data={processedData}
          sign="negative"
          color={color}
          yLogBase={yLogBase}
          hideHeading
        />
      </div>
    </div>
  );
}

export default memo(Spectrum2DHistogram);
