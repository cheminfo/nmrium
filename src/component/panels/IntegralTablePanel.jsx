import lodash from 'lodash';
import React, { useCallback, useMemo, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useModal } from '../elements/Modal';
import ReactTable from '../elements/ReactTable/ReactTable';
import Select from '../elements/Select';
import ToolTip from '../elements/ToolTip/ToolTip';
import NumberInputModal from '../modal/NumberInputModal';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_DATA,
  CHANGE_INTEGRAL_SUM,
} from '../reducer/types/Types';
import formatNumber from '../utility/FormatNumber';

import { SignalKinds } from './constants/SignalsKinds';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import PreferencesHeader from './header/PreferencesHeader';
import NoTableData from './placeholder/NoTableData';
import IntegralsPreferences from './preferences-panels/IntegralsPreferences';
import { integralDefaultValues } from './preferences-panels/defaultValues';

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
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

const IntegralTablePanel = memo(() => {
  const {
    activeSpectrum,
    data: SpectrumsData,
    preferences,
    activeTab,
    xDomain,
  } = useChartData();

  const [filterIsActive, setFilterIsActive] = useState(false);
  const [integralsCounter, setIntegralsCounter] = useState(0);

  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const [isTableVisible, setTableVisibility] = useState(true);
  const settingRef = useRef();

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
  const defaultColumns = [
    {
      orderIndex: 1,
      Header: '#',
      Cell: ({ row }) => row.index + 1,
      width: 10,
    },

    {
      orderIndex: 2,
      Header: 'From',
      accessor: 'from',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => row.original.from.toFixed(2),
    },
    {
      orderIndex: 3,
      Header: 'To',
      accessor: 'to',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => row.original.to.toFixed(2),
    },
    {
      orderIndex: 6,
      Header: 'Kind',
      accessor: 'kind',
      sortType: 'basic',
      resizable: true,
      Cell: ({ row }) => (
        <Select
          onChange={(value) => changeIntegralDataHandler(value, row)}
          data={SignalKinds}
          style={selectStyle}
          defaultValue={row.original.kind}
        />
      ),
    },
    {
      orderIndex: 7,
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

  const checkPreferences = (integralsPreferences, key) => {
    const val =
      integralsPreferences === undefined ||
      Object.keys(integralsPreferences).length === 0 ||
      (integralsPreferences && integralsPreferences[key] === true)
        ? true
        : false;
    return val;
  };

  const tableColumns = useMemo(() => {
    const setCustomColumn = (array, index, columnLabel, cellHandler) => {
      array.push({
        orderIndex: index,
        Header: columnLabel,
        sortType: 'basic',
        Cell: ({ row }) => cellHandler(row),
      });
    };

    const integralsPreferences = lodash.get(
      preferences,
      `panels.integrals.[${activeTab}]`,
    );
    // if (integralsPreferences) {
    let cols = [...defaultColumns];
    if (checkPreferences(integralsPreferences, 'showAbsolute')) {
      setCustomColumn(cols, 4, 'Absolute', (row) =>
        formatNumber(
          row.original.absolute,
          integralsPreferences &&
            Object.prototype.hasOwnProperty.call(
              integralsPreferences,
              'absoluteFormat',
            )
            ? integralsPreferences.absoluteFormat
            : integralDefaultValues.absoluteFormat,
        ),
      );
    }
    if (checkPreferences(integralsPreferences, 'showNB')) {
      const n = activeTab && activeTab.replace(/[0-9]/g, '');
      setCustomColumn(cols, 5, `nb ${n}`, (row) => {
        return row.original.integral
          ? formatNumber(
              row.original.integral,
              integralsPreferences &&
                Object.prototype.hasOwnProperty.call(
                  integralsPreferences,
                  'NBFormat',
                )
                ? integralsPreferences.NBFormat
                : integralDefaultValues.NBFormat,
            )
          : null;
      });
    }

    return cols.sort(
      (object1, object2) => object1.orderIndex - object2.orderIndex,
    );
  }, [activeTab, defaultColumns, preferences]);

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;

    if (_data && _data.integrals && _data.integrals.values) {
      setIntegralsCounter(_data.integrals.values.length);
    }

    return _data && _data.integrals && _data.integrals.values
      ? filterIsActive
        ? _data.integrals.values.filter(
            (integral) =>
              (integral.to >= xDomain[0] && integral.from <= xDomain[1]) ||
              (integral.from <= xDomain[0] && integral.to >= xDomain[1]),
          )
        : _data.integrals.values.map((integral) => {
            return (integral.to >= xDomain[0] && integral.from <= xDomain[1]) ||
              (integral.from <= xDomain[0] && integral.to >= xDomain[1])
              ? {
                  ...integral,
                  isConstantlyHighlighted: true,
                }
              : integral;
          })
      : [];
  }, [SpectrumsData, activeSpectrum, filterIsActive, xDomain]);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_INTEGRAL, integralID: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted,Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  const changeIntegralSumHandler = useCallback(
    (value) => {
      if (value) {
        dispatch({ type: CHANGE_INTEGRAL_SUM, value });
      }

      modal.close();
    },
    [dispatch, modal],
  );

  const elementsCount = useMemo(() => {
    return activeSpectrum &&
      SpectrumsData &&
      SpectrumsData[activeSpectrum.index] &&
      SpectrumsData[activeSpectrum.index].integrals &&
      SpectrumsData[activeSpectrum.index].integrals.options &&
      SpectrumsData[activeSpectrum.index].integrals.options.sum !== undefined
      ? SpectrumsData[activeSpectrum.index].integrals.options.sum
      : null;
  }, [SpectrumsData, activeSpectrum]);

  const showChangeIntegralSumModal = useCallback(() => {
    modal.show(
      <NumberInputModal
        header={`Set new integral sum (current: ${elementsCount})`}
        onClose={() => modal.close()}
        onSave={changeIntegralSumHandler}
      />,
    );
  }, [changeIntegralSumHandler, elementsCount, modal]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      setTimeout(
        () => {
          setTableVisibility(false);
        },
        400,
        isFlipped,
      );
    } else {
      setTableVisibility(true);
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
    setTableVisibility(true);
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  return (
    <>
      <div style={styles.container}>
        {!isFlipped && (
          <DefaultPanelHeader
            counter={integralsCounter}
            onDelete={handleDeleteAll}
            deleteToolTip="Delete All Integrals"
            onFilter={handleOnFilter}
            filterToolTip={
              filterIsActive
                ? 'Show all integrals'
                : 'Hide integrals out of view'
            }
            filterIsActive={filterIsActive}
            counterFiltered={data && data.length}
            showSettingButton="true"
            onSettingClick={settingsPanelHandler}
          >
            <ToolTip
              title={`Change Integrals sum (${elementsCount})`}
              popupPlacement="right"
            >
              <button
                style={styles.sumButton}
                type="button"
                onClick={showChangeIntegralSumModal}
              >
                Σ
              </button>
            </ToolTip>
          </DefaultPanelHeader>
        )}
        {isFlipped && (
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
        )}

        <ReactCardFlip
          isFlipped={isFlipped}
          infinite={true}
          containerStyle={{ height: '100%' }}
        >
          <div style={!isTableVisible ? { display: 'none' } : {}}>
            {data && data.length > 0 ? (
              <ReactTable data={data} columns={tableColumns} />
            ) : (
              <NoTableData />
            )}
          </div>
          <IntegralsPreferences data={SpectrumsData} ref={settingRef} />
        </ReactCardFlip>
      </div>
    </>
  );
});

export default IntegralTablePanel;
