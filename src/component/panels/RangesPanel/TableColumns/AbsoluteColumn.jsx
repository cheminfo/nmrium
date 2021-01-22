import FormatNumber from '../../../utility/FormatNumber';

function AbsoluteColumn({ rowSpanTags, value, onHoverRange, format }) {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {FormatNumber(value, format)}
    </td>
  );
}

export default AbsoluteColumn;
