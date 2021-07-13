import lodashGet from 'lodash/get';

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
}

function CouplingColumn({ rowData, onHoverSignal }: CouplingColumnProps) {
  const result = lodashGet(rowData, 'tableMetaInfo.signal.j');
  return (
    <td {...onHoverSignal}>
      {result
        ?.map((coupling) =>
          !isNaN(coupling.coupling) ? coupling.coupling.toFixed(1) : '',
        )
        .join(',')}
    </td>
  );
}

export default CouplingColumn;
