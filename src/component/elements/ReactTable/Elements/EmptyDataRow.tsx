import { FaRegEyeSlash } from 'react-icons/fa';

export function EmptyDataRow(props) {
  const { columns, text } = props;
  return (
    <tr>
      <td
        colSpan={columns.length}
        style={{ textAlign: 'center', padding: '0.5em' }}
      >
        <FaRegEyeSlash
          style={{
            display: 'inline-block',
            margin: '0px 10px',
            fontSize: '1.5em',
            color: '#6a6a6a',
          }}
        />
        <span style={{ fontSize: '1.1em' }}>{text}</span>
      </td>
    </tr>
  );
}
