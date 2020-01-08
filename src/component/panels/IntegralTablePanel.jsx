import React, { useContext, useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import ReactTable from '../elements/ReactTable/ReactTable';
import { ChartContext } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_INTEGRAL, CHANGE_INTEGRAL_DATA } from '../reducer/Actions';
import { useModal } from '../elements/Modal';
import Select from '../elements/Select';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
};

const signalKinds = [
  {
    key: 'signal',
    label: 'Signal',
    value: 'signal',
  },
  {
    key: 'reference',
    label: 'Reference',
    value: 'reference',
  },
  {
    key: 'solvent',
    label: 'Solvent',
    value: 'solvent',
  },
  {
    key: 'impurity',
    label: 'Impurity',
    value: 'impurity',
  },
  {
    key: 'standard',
    label: 'Standard',
    value: 'standard',
  },
  {
    key: 'p1',
    label: 'P1',
    value: 'p1',
  },
  {
    key: 'p2',
    label: 'P2',
    value: 'p2',
  },
  {
    key: 'p3',
    label: 'P3',
    value: 'p3',
  },
];

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

const IntegralTablePanel = () => {
  const { activeSpectrum, data: SpectrumsData, molecules } = useContext(
    ChartContext,
  );
  const dispatch = useDispatch();
  const modal = useModal();

  const deletePeakHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_INTEGRAL,
        integralID: params.id,
      });
    },
    [dispatch],
  );
  const changeIntegralDataHandler = useCallback(
    (value, row) => {
      const data = { ...row.original, kind: value };
      dispatch({
        type: CHANGE_INTEGRAL_DATA,
        data,
      });
    },
    [dispatch],
  );
  const columns = [
    {
      Header: '#',
      Cell: ({ row }) => row.index + 1,
      width: 10,
    },

    {
      Header: 'From',
      accessor: 'from',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => row.original.from.toFixed(2),
    },
    {
      Header: 'To',
      accessor: 'to',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => row.original.to.toFixed(2),
    },
    {
      Header: 'Integral',
      accessor: 'value',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => row.original.value.toFixed(2),
    },
    {
      Header: 'signal kind',
      accessor: 'kind',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => (
        <Select
          onChange={(value) => changeIntegralDataHandler(value, row)}
          data={signalKinds}
          style={selectStyle}
          defaultValue={row.original.signalKind}
        />
      ),
    },
    {
      Header: '',
      id: 'delete-button',
      Cell: ({ row }) => (
        <button
          type="button"
          className="delete-button"
          onClick={(e) => deletePeakHandler(e, row)}
        >
          <FaRegTrashAlt />
        </button>
      ),
    },
  ];

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;
    if (_data && _data.integrals) {
      if (_data.info.nucleus === '1H' && molecules && molecules.length > 0) {
        columns.splice(columns.length - 2, 0, {
          Header: 'nbH',
          sortType: 'basic',
          resizable: true,
          Cell: () => molecules[0].atoms.H,
        });
      }
      return _data.integrals;
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum, columns, molecules]);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_INTEGRAL, integralID: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted,Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  return (
    <>
      <div style={styles.container}>
        <DefaultPanelHeader
          onDelete={handleDeleteAll}
          counter={data && data.length}
          deleteToolTip="Delete All Integrals"
        />
        {data && data.length > 0 ? (
          <ReactTable data={data} columns={columns} />
        ) : (
          <NoTableData />
        )}
      </div>
    </>
  );
};

export default IntegralTablePanel;
