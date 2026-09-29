import styled from '@emotion/styled';
import { memo, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { Sections } from '../../../../elements/Sections.tsx';

import PlotChart from './PlotChart.js';
import { processSnapPlot } from './processSnapPlot.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
`;

const BlockContainer = styled.div`
  display: block;
`;

const yLogBase = 2;
interface Spectrum1DHistogramProps {
  color?: string;
  data: any;
}

function Spectrum1DHistogram({
  color = 'red',
  data,
}: Spectrum1DHistogramProps) {
  const processedData = useMemo(() => {
    return processSnapPlot('1D', data, yLogBase);
  }, [data]);
  const [isOpen, setIsOpen] = useState(false);

  const isApplyToAllSelected = useWatch({ name: 'applyToAll' });

  if (isApplyToAllSelected) return null;

  return (
    <Sections>
      <Sections.Item
        id="spectrum-1d-histogram"
        title="SAN plot"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Container>
          <BlockContainer>
            <PlotChart
              hideHeading
              data={processedData}
              sign="positive"
              color={color}
              yLogBase={yLogBase}
            />
          </BlockContainer>
          <BlockContainer>
            <PlotChart
              data={processedData}
              sign="negative"
              color={color}
              yLogBase={yLogBase}
              hideHeading
            />
          </BlockContainer>
        </Container>
      </Sections.Item>
    </Sections>
  );
}

export default memo(Spectrum1DHistogram);
