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
    cursor: 'pointer',
  },
};

interface InformationPanelInnerProps {
  info: any;
  meta: any;
  customInfo: any;
}

function Arrow(props: { isOpen?: boolean }) {
  const { isOpen = true } = props;
  return (
    <div
      style={{
        fontSize: '1.3em',
        transform: `rotate(${isOpen ? 90 : 0}deg)`,
        transformOrigin: '50% 50%',
        display: 'inline-block',
        lineHeight: 1,
        padding: isOpen ? '5px 0 0 0' : '0 5px 0 0',
        verticalAlign: 'middle',
      }}
    >
      &#8227;
    </div>
  );
}

type InformationData = Array<{ key: string; value: string }>;

interface InformationTableProps {
  data: InformationData;
  columns: any;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  isOpen: boolean;
}

function InformationTable(props: InformationTableProps) {
  const { data, columns, title, onClick, isOpen = true } = props;
  return (
    <>
      <div style={styles.tableHeader} onClick={onClick}>
        <Arrow isOpen={isOpen} />
        <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>
          {title}
        </span>
      </div>
      {isOpen && (
        <ReactTableFlexLayout
          data={data}
          columns={columns}
          style={{ height: 'auto' }}
        />
      )}
    </>
  );
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

type DataSetKey = 'info' | 'meta' | 'customInfo';

function InformationPanelInner({
  info,
  meta,
  customInfo,
}: InformationPanelInnerProps) {
  const [searchKey, setSearchKey] = useState();
  const [panelsStatus, openPanel] = useState<Record<DataSetKey, boolean>>({
    info: true,
    meta: true,
    customInfo: true,
  });

  function handleSearch(e) {
    const searchKey = e.target.value.toLowerCase();
    setSearchKey(searchKey);
  }

  const matchesInfo = filter(searchKey, info);
  const matchesMeta = filter(searchKey, meta);
  const matchesMetaInfo = filter(searchKey, customInfo);

  function handleOpen(key: DataSetKey) {
    openPanel((prevPanelsStatus) => ({
      ...prevPanelsStatus,
      [key]: !prevPanelsStatus[key],
    }));
  }

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
        <InformationTable
          data={matchesMetaInfo}
          columns={columns}
          title="Custom information"
          onClick={() => handleOpen('customInfo')}
          isOpen={panelsStatus.customInfo}
        />
        <InformationTable
          data={matchesInfo}
          columns={columns}
          title="Spectrum information"
          onClick={() => handleOpen('info')}
          isOpen={panelsStatus.info}
        />
        <InformationTable
          data={matchesMeta}
          columns={columns}
          title="Other spectrum parameters"
          onClick={() => handleOpen('meta')}
          isOpen={panelsStatus.meta}
        />
      </div>
    </div>
  );
}

const MemoizedInformationPanel = memo(InformationPanelInner);

const emptyData = { info: {}, meta: {} };

export default function InformationPanel() {
  const { info, meta, customInfo } = useSpectrum(emptyData);

  return <MemoizedInformationPanel {...{ info, meta, customInfo }} />;
}
