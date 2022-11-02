import lodashGet from 'lodash/get';

import { formatNumber } from '../../../utility/formatNumber';

interface CouplingColumnProps {
  rowData: {
    id: number;
    from: number;
    to: number;
    tableMetaInfo: any;
  };
  onHoverSignal?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  format: string;
}

function CouplingColumn({
  rowData,
  onHoverSignal,
  format,
}: CouplingColumnProps) {
  const result = lodashGet(rowData, 'tableMetaInfo.signal.js');
  return (
    <td {...onHoverSignal}>
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
