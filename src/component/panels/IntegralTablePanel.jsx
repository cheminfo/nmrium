import React, { useCallback, useMemo, useState, useRef } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import ReactCardFlip from 'react-card-flip';
import lodash from 'lodash';

import ReactTable from '../elements/ReactTable/ReactTable';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_DATA,
  CHANGE_INTEGRAL_SUM,
} from '../reducer/Actions';
import { useModal } from '../elements/Modal';
import Select from '../elements/Select';
import IntegralSumModal from '../modal/IntegralSumModal';
import ToolTip from '../elements/ToolTip/ToolTip';
import formatNumber from '../utility/FormatNumber';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import PreferencesHeader from './header/PreferencesHeader';
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
  const {
    activeSpectrum,
    data: SpectrumsData,
    molecules,
    preferences,
    activeTab,
  } = useChartData();
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
          data={signalKinds}
          style={selectStyle}
          defaultValue={row.original.signalKind}
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
    if (checkPreferences(integralsPreferences, 'showValue')) {
      setCustomColumn(cols, 4, 'Value', (row) =>
        formatNumber(
          row.original.value,
          integralsPreferences &&
            Object.prototype.hasOwnProperty.call(
              integralsPreferences,
              'valueFormat',
            )
            ? integralsPreferences.valueFormat
            : integralDefaultValues.valueFormat,
        ),
      );
    }
    if (checkPreferences(integralsPreferences, 'showNB')) {
      const n = activeTab && activeTab.replace(/[0-9]/g, '');
      setCustomColumn(cols, 5, `nb ${n}`, (row) =>
        formatNumber(
          row.original.relative,
          integralsPreferences &&
            Object.prototype.hasOwnProperty.call(
              integralsPreferences,
              'NBFormat',
            )
            ? integralsPreferences.NBFormat
            : integralDefaultValues.NBFormat,
        ),
      );
    }

    return cols.sort(
      (object1, object2) => object1.orderIndex - object2.orderIndex,
    );
  }, [activeTab, defaultColumns, molecules, preferences]);

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;
    if (_data && _data.integrals.values) {
      return _data.integrals.values;
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  console.log(data);

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

  const showChangeIntegralSumModal = useCallback(() => {
    modal.show(
      <IntegralSumModal
        onClose={() => modal.close()}
        onSave={changeIntegralSumHandler}
      />,
    );
  }, [changeIntegralSumHandler, modal]);

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

  return (
    <>
      <div style={styles.container}>
        {!isFlipped && (
          <DefaultPanelHeader
            onDelete={handleDeleteAll}
            counter={data && data.length}
            deleteToolTip="Delete All Integrals"
            showSettingButton="true"
            onSettingClick={settingsPanelHandler}
          >
            <ToolTip title="Change Integrals sum" popupPlacement="right">
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
};

export default IntegralTablePanel;
