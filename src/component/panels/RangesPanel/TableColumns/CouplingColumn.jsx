import lodashGet from 'lodash/get';

function CouplingColumn({ rowData, onHoverSignal }) {
  const result = lodashGet(rowData, 'tableMetaInfo.signal.j');
  return (
    <td {...onHoverSignal}>
      {result &&
        result.map((coupling) => coupling.coupling.toFixed(1)).join(',')}
    </td>
  );
}

export default CouplingColumn;
