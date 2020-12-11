import lodash from 'lodash';

const CouplingColumn = ({ rowData, onHoverSignal }) => {
  const result = lodash.get(rowData, 'tableMetaInfo.signal.j');
  return (
    <td {...onHoverSignal}>
      {result &&
        result.map((coupling) => coupling.coupling.toFixed(1)).join(',')}
    </td>
  );
};

export default CouplingColumn;
