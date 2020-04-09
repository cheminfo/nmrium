import { X } from 'ml-spectra-processing';
import React, { useCallback, useMemo, memo, useState } from 'react';
import { useAlert } from 'react-alert';
import { FaRegTrashAlt, FaFileExport } from 'react-icons/fa';
import { getACS } from 'spectra-data-ranges';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useModal } from '../elements/Modal';
import ReactTable from '../elements/ReactTable/ReactTable';
import ReactTableExpandable from '../elements/ReactTable/ReactTableExpandable';
import Select from '../elements/Select';
import ToolTip from '../elements/ToolTip/ToolTip';
import ConnectToContext from '../hoc/ConnectToContext';
import CopyClipboardModal from '../modal/CopyClipboardModal';
import NumberInputModal from '../modal/NumberInputModal';
import {
  DELETE_RANGE,
  CHANGE_RANGE_DATA,
  CHANGE_RANGE_SUM,
} from '../reducer/types/Types';
import { copyTextToClipboard } from '../utility/Export';

import { SignalKinds } from './constants/SignalsKinds';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import NoTableData from './placeholder/NoTableData';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  sumButton: {
    borderRadius: '5px',
    marginTop: '3px',
    color: 'white',
    backgroundColor: '#6d6d6d',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

const RangesTablePanel = memo(({ data: SpectrumsData, activeSpectrum }) => {
  // const { data: SpectrumsData, activeSpectrum } = useChartData();
  const { xDomain } = useChartData();
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [rangesCounter, setRangesCounter] = useState(0);

  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const deleteRangeHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_RANGE,
        rangeID: params.id,
      });
    },
    [dispatch],
  );

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;

    if (_data && _data.ranges && _data.ranges.values) {
      setRangesCounter(_data.ranges.values.length);
    }

    return _data && _data.ranges && _data.ranges.values
      ? filterIsActive
        ? _data.ranges.values.filter(
            (range) =>
              (range.to >= xDomain[0] && range.from <= xDomain[1]) ||
              (range.from <= xDomain[0] && range.to >= xDomain[1]),
          )
        : _data.ranges.values.map((range) =>
            (range.to >= xDomain[0] && range.from <= xDomain[1]) ||
            (range.from <= xDomain[0] && range.to >= xDomain[1])
              ? { ...range, isConstantlyHighlighted: true }
              : range,
          )
      : [];
  }, [SpectrumsData, activeSpectrum, filterIsActive, xDomain]);

  const saveToClipboardHandler = useCallback(
    (value) => {
      const success = copyTextToClipboard(value);
      if (success) {
        alert.show('Coped to clipboard');
      } else {
        alert.error('Coped to clipboard failed');
      }
    },
    [alert],
  );
  const saveJSONToClipboardHandler = useCallback(
    (value) => {
      const _data =
        activeSpectrum && SpectrumsData
          ? SpectrumsData[activeSpectrum.index]
          : null;

      if (_data) {
        const { from, to } = value;
        const { fromIndex, toIndex } = X.getFromToIndex(_data.x, {
          from,
          to,
        });

        const dataToClipboard = {
          x: _data.x.slice(fromIndex, toIndex),
          y: _data.y.slice(fromIndex, toIndex),
          ...value,
        };

        const success = copyTextToClipboard(
          JSON.stringify(dataToClipboard, undefined, 2),
        );

        if (success) {
          alert.show('Coped to clipboard');
        } else {
          alert.error('Coped to clipboard failed');
        }
      }
    },
    [SpectrumsData, activeSpectrum, alert],
  );

  const closeClipBoardHandler = useCallback(() => {
    modal.close();
  }, [modal]);

  const changeRangeSignalKindHandler = useCallback(
    (value, row) => {
      const _data = { ...row.original, kind: value };
      dispatch({
        type: CHANGE_RANGE_DATA,
        data: _data,
      });
    },
    [dispatch],
  );

  const saveAsHTMLHandler = useCallback(() => {
    const result = getACS(data);
    modal.show(
      <CopyClipboardModal
        text={result}
        onCopyClick={saveToClipboardHandler}
        onClose={closeClipBoardHandler}
      />,
      {},
    );
  }, [closeClipBoardHandler, data, modal, saveToClipboardHandler]);

  // define columns for different (sub)tables and expandable ones
  const columnsRanges = [
    {
      Header: () => null,
      id: 'expander',
      Cell: ({ row }) => (
        <span {...row.getExpandedToggleProps()}>
          {row.isExpanded ? '\u25BC' : '\u25B6'}
        </span>
      ),
    },
    {
      Header: '#',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'From',
      accessor: 'from',
      Cell: ({ row }) => row.original.from.toFixed(2),
    },
    {
      Header: 'To',
      accessor: 'to',
      Cell: ({ row }) => row.original.to.toFixed(2),
    },

    {
      Header: 'Absolute',
      accessor: 'absolute',
      Cell: ({ row }) => row.original.absolute.toFixed(1),
    },
    {
      Header: 'Integral',
      accessor: 'integral',
      Cell: ({ row }) => row.original.integral.toFixed(1),
    },
    {
      Header: '#Signals',
      Cell: ({ row }) =>
        `${row.original.signal.length}: ${row.original.signal
          .map((s) => s.multiplicity)
          .join(',')}`,
    },
    {
      Header: 'Kind',
      accessor: 'kind',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => (
        <Select
          onChange={(value) => changeRangeSignalKindHandler(value, row)}
          data={SignalKinds}
          style={selectStyle}
          defaultValue={row.original.kind}
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
          onClick={(e) => deleteRangeHandler(e, row)}
        >
          <FaRegTrashAlt />
        </button>
      ),
    },
  ];

  const columnsSignals = [
    {
      Header: '#',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'Multiplicity',
      accessor: 'multiplicity',
    },
    {
      Header: 'Delta',
      accessor: 'delta',
      Cell: ({ row }) => row.original.delta.toFixed(3),
    },
    {
      Header: 'J',
      Cell: ({ row }) =>
        row.original.j
          ? row.original.j
              .map((j) => `${j.multiplicity} (${j.coupling.toFixed(2)}Hz)`)
              .join(', ')
          : '',
    },
  ];

  const columnsCouplings = [
    {
      Header: 'Couplings',
      columns: [
        {
          Header: '#',
          Cell: ({ row }) => row.index + 1,
        },
        {
          Header: 'Multiplicity',
          accessor: 'multiplicity',
        },
        {
          Header: 'Coupling',
          accessor: 'coupling',
          Cell: ({ row }) => row.original.coupling.toFixed(3),
        },
      ],
    },
  ];

  // render method for couplings sub-table
  const renderRowSubComponentCouplings = ({ row }) => {
    return row &&
      row.original &&
      row.original.j &&
      row.original.j.length > 0 ? (
      <ReactTable data={row.original.j} columns={columnsCouplings} />
    ) : null;
  };

  const contextMenu = [
    {
      label: 'Save to Clipboard',
      onClick: saveJSONToClipboardHandler,
    },
  ];

  // render method for signals sub-table; either expandable or not
  const renderRowSubComponentSignals = ({ row }) => {
    return row &&
      row.original &&
      row.original.signal &&
      row.original.signal.find((signal) => signal.j && signal.j.length > 0) ? (
      <ReactTableExpandable
        columns={columnsSignals}
        data={row.original.signal}
        renderRowSubComponent={renderRowSubComponentCouplings}
        context={contextMenu}
      />
    ) : (
      <ReactTable columns={columnsSignals} data={row.original.signal} />
    );
  };

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_RANGE, rangeID: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted,Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  const changeRangesSumHandler = useCallback(
    (value) => {
      if (value) {
        dispatch({ type: CHANGE_RANGE_SUM, value });
      }

      modal.close();
    },
    [dispatch, modal],
  );

  const showChangeRangesSumModal = useCallback(() => {
    modal.show(
      <NumberInputModal
        header="Set new range sum"
        onClose={() => modal.close()}
        onSave={changeRangesSumHandler}
      />,
    );
  }, [changeRangesSumHandler, modal]);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  return (
    <div style={styles.container}>
      <DefaultPanelHeader
        counter={rangesCounter}
        onDelete={handleDeleteAll}
        deleteToolTip="Delete All Ranges"
        onFilter={handleOnFilter}
        filterToolTip={
          filterIsActive ? 'Show all ranges' : 'Hide ranges out of view'
        }
        filterIsActive={filterIsActive}
        counterFiltered={data && data.length}
      >
        <ToolTip title="Preview publication string" popupPlacement="right">
          <button
            style={styles.button}
            type="button"
            onClick={saveAsHTMLHandler}
          >
            <FaFileExport />
          </button>
        </ToolTip>
        <ToolTip title="Change Ranges sum" popupPlacement="right">
          <button
            style={styles.sumButton}
            type="button"
            onClick={showChangeRangesSumModal}
          >
            Σ
          </button>
        </ToolTip>
      </DefaultPanelHeader>

      {data && data.length > 0 ? (
        <ReactTableExpandable
          columns={columnsRanges}
          data={data}
          renderRowSubComponent={renderRowSubComponentSignals}
          context={contextMenu}
        />
      ) : (
        <NoTableData />
      )}
    </div>
  );
});

export default ConnectToContext(RangesTablePanel, useChartData);
