import React, { useCallback, useMemo, useRef } from 'react';
import { FaRegTrashAlt, FaFileExport, FaCopy } from 'react-icons/fa';
import { getACS } from 'spectra-data-ranges';
import { useAlert } from 'react-alert';

import { DELETE_RANGE } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ReactTableExpandable from '../elements/ReactTable/ReactTableExpandable';
import ReactTable from '../elements/ReactTable/ReactTable';
import { ConfirmationDialog } from '../elements/Modal';
import ToolTip from '../elements/ToolTip/ToolTip';
import useModal from '../elements/Modal/useModal';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const RangesTablePanel = () => {
  const confirmRef = useRef();
  const { data: SpectrumsData, activeSpectrum } = useChartData();
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

    if (_data && _data.ranges) {
      return _data.ranges.map((range) => {
        return {
          from: range.from,
          to: range.to,
          integral: range.integral,
          id: range.id,
          signals: range.signal,
        };
      });
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  const saveToClipboradHandler = useCallback(
    (value) => {
      try {
        navigator.clipboard.writeText(value).then(() => {
          alert.show('Coped to cliborad');
        });
      } catch (err) {
        alert.error('Coped to cliborad falid');
      }
    },
    [alert],
  );

  const closeClipBoradHandler = useCallback(() => {
    modal.close();
  }, [modal]);

  const CopyClipboard = ({ text }) => {
    return (
      <div style={{ overFlow: 'auto' }}>
        <div
          style={{ padding: ' 5px 0px', borderBottom: '0.55px solid #ebebeb' }}
        >
          <button
            type="button"
            style={styles.button}
            onClick={() => saveToClipboradHandler(text)}
          >
            <FaCopy />
          </button>
        </div>
        <textarea
          style={{
            padding: '5px',
            width: '100%',
            height: '180px',
            border: 'none',
          }}
          readOnly={true}
        >
          {text}
        </textarea>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              border: 'none',
              backgroundColor: '#efefef',
              padding: '10px',
            }}
            onClick={closeClipBoradHandler}
          >
            close
          </button>
        </div>
      </div>
    );
  };

  const saveAsHTMLHandler = useCallback(() => {
    const result = getACS(data);
    modal.show(<CopyClipboard text={result} />, {});
  }, [data, modal]);

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
      Header: 'Integral',
      accessor: 'integral',
      Cell: ({ row }) => row.original.integral.toFixed(1),
    },
    {
      Header: '#Signals',
      Cell: ({ row }) => row.original.signals.length,
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
      Header: 'Signals',
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
          Header: 'Delta',
          accessor: 'delta',
          Cell: ({ row }) => row.original.delta.toFixed(3),
        },
        {
          Header: '#Peaks',
          Cell: ({ row }) => row.original.peak.length,
        },
      ],
    },
  ];

  const columnsSignalsExpandable = [
    {
      Header: () => null,
      id: 'expanderSignals',
      Cell: ({ row }) => (
        <span {...row.getExpandedToggleProps()}>
          {row.isExpanded ? '\u25BC' : '\u25B6'}
        </span>
      ),
    },
    ...columnsSignals,
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
    return row.original.j && row.original.j.length > 0 ? (
      <ReactTable data={row.original.j} columns={columnsCouplings} />
    ) : null;
  };

  // render method for signals sub-table; either expandable or not
  const renderRowSubComponentSignals = ({ row }) => {
    return row.original.signals &&
      row.original.signals.find((signal) => signal.j && signal.j.length > 0) ? (
      <ReactTableExpandable
        columns={columnsSignalsExpandable}
        data={row.original.signals}
        renderRowSubComponent={renderRowSubComponentCouplings}
      />
    ) : (
      <ReactTable columns={columnsSignals} data={row.original.signals} />
    );
  };

  const handleDeleteAll = useCallback(() => {
    confirmRef.current.present();
  }, []);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_RANGE, rangeID: null });
  }, [dispatch]);

  return (
    <>
      <div style={styles.container}>
        <DefaultPanelHeader
          onDelete={handleDeleteAll}
          counter={data && data.length}
          deleteToolTip="Delete All Ranges"
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
        </DefaultPanelHeader>

        {data && data.length > 0 ? (
          <ReactTableExpandable
            columns={columnsRanges}
            data={data}
            renderRowSubComponent={renderRowSubComponentSignals}
          />
        ) : (
          <NoTableData />
        )}
      </div>
      <ConfirmationDialog onYes={yesHandler} ref={confirmRef} />
    </>
  );
};

export default RangesTablePanel;
