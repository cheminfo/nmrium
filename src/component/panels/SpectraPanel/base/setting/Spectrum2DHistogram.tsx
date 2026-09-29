import styled from '@emotion/styled';
import { memo, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { Sections } from '../../../../elements/Sections.tsx';

import PlotChart from './PlotChart.js';
import { processSnapPlot } from './processSnapPlot.js';

const Container = styled.div`
  border-top: 1px solid #ededed;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 10px;
`;

interface Spectrum2DHistogramProps {
  color?: string;
  data: any;
}

const yLogBase = 2;

function Spectrum2DHistogram({
  color = 'red',
  data,
}: Spectrum2DHistogramProps) {
  const [isOpen, setIsOpen] = useState(false);

  const processedData = useMemo(() => {
    return processSnapPlot('2D', data.rr, yLogBase);
  }, [data]);

  const isApplyToAllSelected = useWatch({ name: 'applyToAll' });

  if (isApplyToAllSelected) return null;

  return (
    <Sections>
      <Sections.Item
        id="spectrum-2d-histogram"
        title="SAN plot"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Container>
          <PlotChart
            data={processedData}
            sign="positive"
            color={color}
            yLogBase={yLogBase}
            hideHeading
          />
          <PlotChart
            data={processedData}
            sign="negative"
            color={color}
            yLogBase={yLogBase}
            hideHeading
          />
        </Container>
      </Sections.Item>
    </Sections>
  );
}

export default memo(Spectrum2DHistogram);
