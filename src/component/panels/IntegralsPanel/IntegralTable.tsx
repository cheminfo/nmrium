import lodashGet from 'lodash/get';
import { useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { SignalKinds } from '../../../data/constants/SignalsKinds';
import {
  Integral,
  integralCountingCondition,
} from '../../../data/data1d/Spectrum1D';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import Select from '../../elements/Select';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_DATA,
  CHANGE_INTEGRAL_RELATIVE,
} from '../../reducer/types/Types';
import formatNumber from '../../utility/FormatNumber';
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

import { IntegralPanelInnerProps } from './IntegralPanel';

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

interface IntegralTableProps
  extends Pick<IntegralPanelInnerProps, 'activeTab' | 'preferences'> {
  data: Array<Integral>;
}

function IntegralTable({ activeTab, data, preferences }: IntegralTableProps) {
  const dispatch = useDispatch();
  const relativeRefs = useRef<any>([]);
  const { rootRef } = useGlobal();
  const deleteIntegralHandler = useCallback(
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
        payload: { data },
      });
    },
    [dispatch],
  );
  const defaultColumns = useMemo(
    () => [
      {
        orderIndex: 1,
        Header: '#',
        Cell: ({ row }) => row.index + 1,
        width: 10,
      },

      {
        orderIndex: 2,
        Header: 'From',
        sortType: 'basic',
        resizable: true,
        accessor: (row) => row.from.toFixed(2),
      },
      {
        orderIndex: 3,
        Header: 'To',
        sortType: 'basic',
        resizable: true,
        accessor: (row) => row.to.toFixed(2),
      },
      {
        orderIndex: 6,
        Header: 'Kind',
        sortType: 'basic',
        resizable: true,
        accessor: (row) => row.kind,
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
        width: '1%',
        maxWidth: '24px',
        minWidth: '24px',
        id: 'delete-button',
        Cell: ({ row }) => (
          <button
            type="button"
            className="delete-button"
            onClick={(e) => deleteIntegralHandler(e, row)}
          >
            <FaRegTrashAlt />
          </button>
        ),
      },
    ],
    [changeIntegralDataHandler, deleteIntegralHandler],
  );

  const saveRealtiveHandler = useCallback(
    (event, row) => {
      const data = { value: event.target.value, id: row.id };
      dispatch({
        type: CHANGE_INTEGRAL_RELATIVE,
        payload: { data },
      });
    },
    [dispatch],
  );
  const editStartHander = useCallback((index) => {
    relativeRefs.current.forEach((ref, i) => {
      if (index !== i && ref) {
        ref.closeEdit();
      }
    });
  }, []);

  useEffect(() => {
    if (rootRef) {
      rootRef.addEventListener('mousedown', editStartHander);
    }
    return () => {
      if (rootRef) {
        rootRef.removeEventListener('mousedown', editStartHander);
      }
    };
  }, [editStartHander, rootRef]);

  const tableColumns = useMemo(() => {
    const setCustomColumn = (array, index, columnLabel, extraParams) => {
      array.push({
        ...extraParams,
        orderIndex: index,
        Header: columnLabel,
        sortType: 'basic',
      });
    };

    const integralsPreferences = getValue(
      preferences,
      `formatting.panels.integrals.[${activeTab}]`,
    );
    let cols = [...defaultColumns];
    if (
      lodashGet(
        integralsPreferences,
        'showAbsolute',
        integralDefaultValues.showAbsolute,
      )
    ) {
      setCustomColumn(cols, 4, 'Absolute', {
        accessor: (row) =>
          formatNumber(
            row.absolute,
            lodashGet(
              integralsPreferences,
              'absoluteFormat',
              integralDefaultValues.absoluteFormat,
            ),
          ),
      });
    }
    if (
      lodashGet(
        integralsPreferences,
        'showRelative',
        integralDefaultValues.showRelative,
      )
    ) {
      const n = activeTab?.replace(/[0-9]/g, '');
      setCustomColumn(cols, 5, `Relative ${n}`, {
        accessor: (row) =>
          formatNumber(
            row.integral,
            lodashGet(
              integralsPreferences,
              'relativeFormat',
              integralDefaultValues.relativeFormat,
            ),
          ),
        Cell: ({ row }) => {
          const value = formatNumber(
            row.original.integral,
            lodashGet(
              integralsPreferences,
              'relativeFormat',
              integralDefaultValues.relativeFormat,
            ),
          );
          const flag = integralCountingCondition(row.original);
          const intergal = flag ? value : `[ ${value} ]`;

          return (
            <EditableColumn
              onEditStart={() => editStartHander(row.index)}
              ref={(ref) => (relativeRefs.current[row.index] = ref)}
              value={intergal}
              onSave={(event) => saveRealtiveHandler(event, row.original)}
              type="number"
            />
          );
        },
      });
    }

    return cols.sort(
      (object1, object2) => object1.orderIndex - object2.orderIndex,
    );
  }, [
    activeTab,
    defaultColumns,
    editStartHander,
    preferences,
    saveRealtiveHandler,
  ]);

  return data && data.length > 0 ? (
    <ReactTable data={data} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
}

export default memo(IntegralTable);
