import { formatNumber } from '../../../utility/formatNumber.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

type CouplingColumnProps = BaseRangeColumnProps & OnHoverEvent;

export default function CouplingColumn({
  row,
  onHover,
  format,
}: CouplingColumnProps) {
  // TODO: make sure row is not a lie and remove the optional chaining.
  const result = row?.tableMetaInfo?.signal?.js;
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
