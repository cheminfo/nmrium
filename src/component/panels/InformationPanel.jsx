import { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';

import ReactTableFlexLayout from '../elements/ReactTable/ReactTableFlexLayout';
import InfoWrapper from '../hoc/InfoWrapper';

const styles = {
  container: {
    height: '100%',
  },
  tableContainer: {
    height: 'calc(100% - 30px)',
  },
  searchInput: {
    width: '100%',
    borderRadius: '5px',
    border: '0.55px solid gray',
    padding: '5px',
    marginBottom: '2px',
  },
};

// information panel
const InformationPanel = memo(({ info, meta }) => {
  const [information, setInformation] = useState({});
  const [matches, setMatchesData] = useState([]);
  const searchRef = useRef();

  const handleSearch = useCallback(
    (e) => {
      const values = Object.keys(information).filter((key) =>
        key
          .toLowerCase()
          .includes(e.target ? e.target.value.toLowerCase() : e.toLowerCase()),
      );
      setMatchesData(values);
    },
    [information],
  );

  useEffect(() => {
    if (searchRef.current) {
      handleSearch(searchRef.current.value);
    }
  }, [handleSearch, searchRef]);

  useEffect(() => {
    if (info && meta) {
      const keys = Object.keys(info).concat(Object.keys(meta));
      setMatchesData(keys);
      setInformation({
        ...info,
        ...meta,
      });
    }
  }, [info, meta]);

  const columns = useMemo(
    () => [
      {
        Header: 'Parameter',
        sortType: 'basic',
        minWidth: 100,
        width: 20,
        maxWidth: 20,
        Cell: ({ row }) => (
          <p style={{ padding: '5px', backgroundColor: 'white' }}>
            {row.original}
          </p>
        ),
      },
      {
        Header: 'Value',
        sortType: 'basic',
        resizable: true,
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
            {information[row.original].toString()}
          </p>
        ),
      },
    ],
    [information],
  );

  return (
    <div style={styles.container}>
      <div>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search for parameter..."
          onChange={handleSearch}
          ref={searchRef}
        />
      </div>
      <div style={styles.tableContainer}>
        <ReactTableFlexLayout data={matches} columns={columns} />
      </div>
    </div>
  );
});

export default InfoWrapper(InformationPanel);
