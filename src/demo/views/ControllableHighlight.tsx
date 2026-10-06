import styled from '@emotion/styled';
import { isSpectrum1D } from '@zakodium/nmrium-core';
import { useState } from 'react';
import { Button } from 'react-science/ui';

import { NMRium } from '../../component/main/index.js';

import type { ViewProps } from './View.helpers.js';
import { useView } from './View.helpers.js';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
`;

const NMRiumContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

export default function ControllableHighlight(props: ViewProps) {
  const [data] = useView(props);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const spectra = (data?.state.data?.spectra ?? []).filter(isSpectrum1D);
  const ranges = spectra.flatMap((spectrum) => spectrum.ranges.values);
  const rangeIds = ranges.map((range) => range.id);

  function handleRandomRanges() {
    const remainingIds = [...rangeIds];
    const selectedIds: string[] = [];
    while (selectedIds.length < 3 && remainingIds.length > 0) {
      const index = Math.floor(Math.random() * remainingIds.length);
      selectedIds.push(...remainingIds.splice(index, 1));
    }
    setHighlightedIds(selectedIds);
  }

  return (
    <Container>
      <Controls>
        <Button
          variant="outlined"
          disabled={rangeIds.length === 0}
          onClick={handleRandomRanges}
        >
          highlight random ranges
        </Button>
        <Button
          variant="outlined"
          disabled={rangeIds.length === 0}
          onClick={() => setHighlightedIds(rangeIds)}
        >
          highlight all ranges
        </Button>
        <Button
          variant="outlined"
          disabled={highlightedIds.length === 0}
          onClick={() => setHighlightedIds([])}
        >
          clear highlights
        </Button>
      </Controls>
      <NMRiumContainer>
        <NMRium
          state={data?.state}
          aggregator={data?.aggregator}
          workspace={props.workspace}
          highlightedIds={highlightedIds}
        />
      </NMRiumContainer>
    </Container>
  );
}
