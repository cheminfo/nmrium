import lodashGet from 'lodash/get.js';

import { formatNumber } from '../../../utility/formatNumber.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

type CouplingColumnProps = BaseRangeColumnProps & OnHoverEvent;

function CouplingColumn({ row, onHover, format }: CouplingColumnProps) {
  const result = lodashGet(row, 'tableMetaInfo.signal.js');
  return (
    <td {...onHover}>
      {result
        ?.map((coupling) =>
          !Number.isNaN(Number(coupling.coupling))
            ? formatNumber(coupling.coupling, format)
            : '',
        )
        .join(',')}
    </td>
  );
}

export default CouplingColumn;
