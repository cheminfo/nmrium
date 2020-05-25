import React, { useEffect, useState } from 'react';
import { ObjectInspector } from 'react-inspector';

import { useChartData } from '../context/ChartContext';
import ReactTable from '../elements/ReactTable/ReactTable';

import NoTableData from './extra/placeholder/NoTableData';

const tableColumns = [
  {
    orderIndex: 1,
    Header: '#',
    Cell: ({ row }) => row.index + 1,
    width: 10,
  },

  //   {
  //     orderIndex: 2,
  //     Header: 'ID',
  //     accessor: 'id',
  //     sortType: 'basic',
  //     resizable: true,
  //     Cell: ({ row }) => row.original.id.toFixed(2),
  //   },
  {
    orderIndex: 3,
    Header: 'zone',
    sortType: 'basic',
    resizable: true,
    Cell: ({ row }) => <ObjectInspector data={row.original} />,
  },
];

const styles = {
  container: {
    // display: 'flex',
    // flexDirection: 'column',
    // height: '100%',
  },
};

const ZonesPanel = () => {
  const { activeSpectrum, data } = useChartData();
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const _data = activeSpectrum && data[activeSpectrum.index];
    if (_data) {
      setZones(_data.zones && _data.zones.values.slice());
    }
  }, [activeSpectrum, data]);
  return (
    <div style={styles.container}>
      {zones && zones.length > 0 ? (
        <ReactTable data={zones} columns={tableColumns} />
      ) : (
        <NoTableData />
      )}
    </div>
  );
};

export default ZonesPanel;
