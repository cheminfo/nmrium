import styled from '@emotion/styled';
import { useState } from 'react';

import type { NMRiumHighlightState } from '../../component/highlight/index.js';
import {
  HighlightProvider,
  emptyHighlightState,
  useHighlight,
} from '../../component/highlight/index.js';

const tableOne = [
  { id: 'A', highlight: [1, 2] },
  { id: 'B', highlight: [0] },
  { id: 'C', highlight: [] },
  { id: 'D', highlight: [3, 4] },
  { id: 'E', highlight: [1, 2, 3] },
  { id: 'F', highlight: [2, 4] },
];

const tableTwo = [
  { id: '1', highlight: ['F'] },
  { id: '2', highlight: ['E'] },
  { id: '3', highlight: ['A', 'B'] },
  { id: '4', highlight: ['B', 'C', 'F'] },
  { id: '5', highlight: [] },
];

const Container = styled.div`
  display: flex;
  padding: 20px;
`;

const PanelContainer = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  border: 1px solid black;
`;

const TableHeader = styled.th`
  font-weight: 600;
  padding: 5px;
`;

const TableCell = styled.td`
  padding: 5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  padding: 20px;
`;

export default function TestHighlight() {
  const [highlight, setHighlight] =
    useState<NMRiumHighlightState>(emptyHighlightState);

  return (
    <>
      <Controls>
        <button
          type="button"
          onClick={() => {
            setHighlight({
              highlighted: ['A', '1', '2'],
              highlightedPermanently: ['A'],
              sourceData: { type: 'UNKNOWN' },
            });
          }}
        >
          Highlight A from outside
        </button>
        <button
          type="button"
          onClick={() => {
            setHighlight(emptyHighlightState);
          }}
        >
          Clear highlight
        </button>
        <span>
          permanent: {highlight.highlightedPermanently.join(', ') || 'none'}
        </span>
      </Controls>
      <HighlightProvider value={highlight} onChange={setHighlight}>
        <Container>
          <PanelContainer>
            <HighlightTable data={tableOne} />
          </PanelContainer>
          <PanelContainer>
            <HighlightTable data={tableTwo} />
          </PanelContainer>
        </Container>
      </HighlightProvider>
    </>
  );
}

interface HighlightTableProps {
  data: Array<{ id: string; highlight: Array<number | string> }>;
}

function HighlightTable(props: HighlightTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>ID</TableHeader>
          <TableHeader>Highlight ids</TableHeader>
        </tr>
      </thead>
      <tbody>
        {props.data.map((datum) => (
          <Tr key={datum.id} value={datum} />
        ))}
      </tbody>
    </Table>
  );
}

interface TrProps {
  value: { id: string; highlight: Array<number | string> };
}

function Tr(props: TrProps) {
  const { value } = props;

  const highlight = useHighlight([value.id, ...value.highlight]);

  return (
    <tr
      key={value.id}
      style={{
        backgroundColor: highlight.isActive ? 'red' : 'transparent',
      }}
      {...highlight.onHover}
    >
      <TableCell>{value.id}</TableCell>
      <TableCell>{value.highlight.join(', ')}</TableCell>
    </tr>
  );
}
