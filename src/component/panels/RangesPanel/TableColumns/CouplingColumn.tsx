import lodashGet from 'lodash/get';

import { formatNumber } from '../../../utility/formatNumber';
import { OnHoverEvent, BaseRangeColumnProps } from '../RangesTableRow';

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
