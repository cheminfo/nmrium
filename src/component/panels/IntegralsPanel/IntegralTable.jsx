import lodash from 'lodash';
import React, { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import Select from '../../elements/Select';
import IntegralsWrapper from '../../hoc/IntegralsWrapper';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_DATA,
  CHANGE_INTEGRAL_RELATIVE,
} from '../../reducer/types/Types';
import formatNumber from '../../utility/FormatNumber';
import { GetPreference } from '../../utility/PreferencesHelper';
import { SignalKinds } from '../extra/constants/SignalsKinds';
import NoTableData from '../extra/placeholder/NoTableData';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

// import ReactCardFlip from './node_modules/react-card-flip';

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

const IntegralTable = memo(
  ({
    integrals,
    info,
    preferences,
    activeTab,
    xDomain,
    enableFilter,
    onIntegralsChange,
  }) => {
    const dispatch = useDispatch();

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
          data,
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
        dispatch({
          type: CHANGE_INTEGRAL_RELATIVE,
          value: event.target.value,
          id: row.id,
        });
      },
      [dispatch],
    );

    const tableColumns = useMemo(() => {
      const setCustomColumn = (array, index, columnLabel, cellHandler) => {
        array.push({
          orderIndex: index,
          Header: columnLabel,
          sortType: 'basic',
          Cell: ({ row }) => cellHandler(row),
        });
      };

      const integralsPreferences = GetPreference(
        preferences,
        `integrals.[${activeTab}]`,
      );
      // if (integralsPreferences) {
      let cols = [...defaultColumns];
      if (
        lodash.get(
          integralsPreferences,
          'showAbsolute',
          integralDefaultValues.showAbsolute,
        )
      ) {
        setCustomColumn(cols, 4, 'Absolute', (row) =>
          formatNumber(
            row.original.absolute,
            lodash.get(
              integralsPreferences,
              'absoluteFormat',
              integralDefaultValues.absoluteFormat,
            ),
          ),
        );
      }
      if (
        lodash.get(
          integralsPreferences,
          'showRelative',
          integralDefaultValues.showRelative,
        )
      ) {
        const n = activeTab && activeTab.replace(/[0-9]/g, '');
        setCustomColumn(cols, 5, `Relative ${n}`, (row) => {
          const formattedNumber = formatNumber(
            row.original.integral,
            lodash.get(
              integralsPreferences,
              'relativeFormat',
              integralDefaultValues.relativeFormat,
            ),
          );
          return (
            <EditableColumn
              value={formattedNumber}
              onSave={(event) => saveRealtiveHandler(event, row.original)}
              type="number"
            />
          );

          // return row.original.kind !== 'signal'
          //   ? `[${formattedNumber}]`
          //   : formattedNumber;
        });
      }

      return cols.sort(
        (object1, object2) => object1.orderIndex - object2.orderIndex,
      );
    }, [activeTab, defaultColumns, preferences, saveRealtiveHandler]);

    const data = useMemo(() => {
      if (info.dimension === 1 && integrals && integrals.values) {
        return integrals.values;
      }
      return [];
    }, [info.dimension, integrals]);

    const tableData = useMemo(() => {
      function isInRange(from, to) {
        const factor = 10000;
        to = to * factor;
        from = from * factor;
        return (
          (to >= xDomain[0] * factor && from <= xDomain[1] * factor) ||
          (from <= xDomain[0] * factor && to >= xDomain[1] * factor)
        );
      }

      const integrals = enableFilter
        ? data.filter((integral) => isInRange(integral.from, integral.to))
        : data;

      onIntegralsChange(integrals);

      return integrals.map((integral) => {
        return {
          ...integral,
          isConstantlyHighlighted: isInRange(integral.from, integral.to),
        };
      });
    }, [data, enableFilter, onIntegralsChange, xDomain]);

    return tableData && tableData.length > 0 ? (
      <ReactTable data={tableData} columns={tableColumns} />
    ) : (
      <NoTableData />
    );
  },
);

export default IntegralsWrapper(IntegralTable);
// export default ContextWrapper(
//   IntegralTable,
//   ['spectrum', 'preferences', 'activeTab', 'xDomain'],
//   { spectrum: ['integrals', 'info'] },
// );
