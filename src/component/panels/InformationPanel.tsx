import { useState, memo, CSSProperties } from 'react';

import Input from '../elements/Input';
import ReactTableFlexLayout from '../elements/ReactTable/ReactTableFlexLayout';
import useSpectrum from '../hooks/useSpectrum';

const styles: Record<
  'container' | 'tableContainer' | 'tableHeader',
  CSSProperties
> = {
  container: {
    height: '100%',
    flexDirection: 'column',
    display: 'flex',
    width: '100%',
  },
  tableContainer: {
    overflow: 'auto',
    display: 'block',
  },
  tableHeader: {
    padding: ' 5px 10px',
    backgroundColor: ' #f8f8f8',
    borderBottom: '1px solid gray',
    fontSize: '1em',
  },
};

interface InformationPanelInnerProps {
  info: any;
  meta: any;
}

function filter(
  searchKey: string | undefined,
  data: Record<any, any>,
): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = [];
  for (const key in data) {
    if (!searchKey || key.toLowerCase().includes(searchKey)) {
      result.push({ key, value: data[key] });
    }
  }
  return result;
}

const columns = [
  {
    Header: 'Parameter',
    sortType: 'basic',
    minWidth: 100,
    width: 20,
    maxWidth: 20,
    accessor: 'key',
    Cell: ({ row }) => (
      <p style={{ padding: '5px', backgroundColor: 'white' }}>
        {row.original.key}
      </p>
    ),
  },
  {
    Header: 'Value',
    sortType: 'basic',
    resizable: true,
    accessor: 'value',
    Cell: ({ row }) => (
      <p
        style={{
          backgroundColor: '#efefef',
          height: '100%',
          padding: '5px',
          fontFamily: 'monospace',
          whiteSpace: 'pre',
          overflow: 'hidden',
        }}
      >
        {`${row.original.value}`}
      </p>
    ),
  },
];

function InformationPanelInner({ info, meta }: InformationPanelInnerProps) {
  const [searchKey, setSearchKey] = useState();

  function handleSearch(e) {
    const searchKey = e.target.value.toLowerCase();
    setSearchKey(searchKey);
  }

  const matchesInfo = filter(searchKey, info);
  const matchesMeta = filter(searchKey, meta);

  return (
    <div style={styles.container}>
      <div>
        <Input
          placeholder="Search for parameter..."
          onChange={handleSearch}
          debounceTime={250}
          style={{
            inputWrapper: { width: '100%' },
            input: { textAlign: 'left', padding: '5px' },
          }}
        />
      </div>
      <div style={styles.tableContainer}>
        <p style={styles.tableHeader}>Spectrum information</p>
        <ReactTableFlexLayout
          data={matchesInfo}
          columns={columns}
          style={{ height: 'auto' }}
        />
        <p style={styles.tableHeader}>Other parameters</p>
        <ReactTableFlexLayout
          data={matchesMeta}
          columns={columns}
          style={{ height: 'auto' }}
        />
      </div>
    </div>
  );
}

const MemoizedInformationPanel = memo(InformationPanelInner);

const emptyData = { info: {}, meta: {} };

export default function InformationPanel() {
  const { info, meta } = useSpectrum(emptyData);

  return <MemoizedInformationPanel {...{ info, meta }} />;
}
