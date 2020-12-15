import lodash from 'lodash';
import { useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { SignalKinds } from '../../../data/constants/SignalsKinds';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
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
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

// import ReactCardFlip from './node_modules/react-card-flip';

const selectStyle = { marginLeft: 10, marginRight: 10, border: 'none' };

const IntegralTable = memo(
  ({
    integrals,
    info,
    activeTab,
    xDomain,
    enableFilter,
    onFilter,
    preferences,
  }) => {
    const dispatch = useDispatch();
    const relativeRefs = useRef([]);
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
        dispatch({
          type: CHANGE_INTEGRAL_RELATIVE,
          value: event.target.value,
          id: row.id,
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
      const setCustomColumn = (array, index, columnLabel, cellHandler) => {
        array.push({
          orderIndex: index,
          Header: columnLabel,
          sortType: 'basic',
          Cell: ({ row }) => cellHandler(row),
        });
      };

      const integralsPreferences = getValue(
        preferences,
        `formatting.panels.integrals.[${activeTab}]`,
      );
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
              onEditStart={() => editStartHander(row.index)}
              ref={(ref) => (relativeRefs.current[row.index] = ref)}
              value={formattedNumber}
              onSave={(event) => saveRealtiveHandler(event, row.original)}
              type="number"
            />
          );
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
      if (info.dimension === 1 && integrals && integrals.values) {
        const _integrals = enableFilter
          ? integrals.values.filter((integral) =>
              isInRange(integral.from, integral.to),
            )
          : integrals.values;

        return _integrals.map((integral) => {
          return {
            ...integral,
            isConstantlyHighlighted: isInRange(integral.from, integral.to),
          };
        });
      }
      return [];
    }, [enableFilter, info.dimension, integrals, xDomain]);

    useEffect(() => {
      onFilter(tableData.length);
    }, [tableData, onFilter]);

    return tableData && tableData.length > 0 ? (
      <ReactTable data={tableData} columns={tableColumns} />
    ) : (
      <NoTableData />
    );
  },
);

export default IntegralsWrapper(IntegralTable);
