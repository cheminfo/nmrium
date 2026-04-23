import { FaRegEyeSlash } from 'react-icons/fa';

interface EmptyDataRowProps {
  numColumns: number;
  text: string;
}

export function EmptyDataRow(props: EmptyDataRowProps) {
  const { numColumns, text } = props;
  return (
    <tr>
      <td
        colSpan={numColumns}
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
