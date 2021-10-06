import { CSSProperties } from 'react';

import { DataBaseRange } from '../../../../data/data1d/database';

const style: CSSProperties = {
  whiteSpace: 'pre-line',
  textOverflow: 'ellipsis',
};

export function RangesRenderer(props: { ranges: DataBaseRange[] }) {
  return (
    <p style={style}>
      {props.ranges
        .map((range) => {
          return range.signals.map((signal) => signal.delta).join(',');
        })
        .join('\n')}
    </p>
  );
}
