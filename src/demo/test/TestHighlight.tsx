/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';

import {
  HighlightProvider,
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

const mainDiv = css`
  display: flex;
  padding: 20px;
`;

const tableDiv = css`
  padding: 20px;
`;

const table = css`
  border: 1px solid black;
`;

const th = css`
  padding: 5px;
  font-weight: 600;
`;

const td = css`
  padding: 5px;
`;

export default function TestHighlight() {
  return (
    <HighlightProvider>
      <div css={mainDiv}>
        <div css={tableDiv}>
          <HighlightTable data={tableOne} />
        </div>
        <div css={tableDiv}>
          <HighlightTable data={tableTwo} />
        </div>
      </div>
    </HighlightProvider>
  );
}

interface HighlightTableProps {
  data: Array<{ id: string; highlight: Array<number | string> }>;
}

function HighlightTable(props: HighlightTableProps) {
  return (
    <table css={table}>
      <thead>
        <tr>
          <th css={th}>ID</th>
          <th css={th}>Highlight ids</th>
        </tr>
      </thead>
      <tbody>
        {props.data.map((datum) => (
          <Tr key={datum.id} value={datum} />
        ))}
      </tbody>
    </table>
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
      <td css={td}>{value.id}</td>
      <td css={td}>{value.highlight.join(', ')}</td>
    </tr>
  );
}
