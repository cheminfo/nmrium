import lodashGet from 'lodash/get';
import { Info1D, Integral } from 'nmr-processing';
import { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { checkIntegralKind } from '../../../data/data1d/Spectrum1D';
import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import Select from '../../elements/Select';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { formatNumber } from '../../utility/formatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

import { IntegralPanelInnerProps } from './IntegralPanel';
import NoDataForFid from '../extra/placeholder/NoDataForFid';
import { useSignalKinds } from '../../hooks/useSignalKinds';

const selectStyle = { width: '100%', border: 'none' };

interface IntegralTableProps
  extends Pick<IntegralPanelInnerProps, 'activeTab'> {
  data: Integral[];
  info: Info1D;
}

function IntegralTable({ activeTab, data, info }: IntegralTableProps) {
  const dispatch = useDispatch();
  const signalKinds = useSignalKinds();

  const deleteIntegralHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const { id } = row.original;
      dispatch({
        type: 'DELETE_INTEGRAL',
        payload: {
          id,
        },
      });
    },
    [dispatch],
  );
  const changeIntegralDataHandler = useCallback(
    (value, row) => {
      const integral = { ...row.original, kind: value };
      dispatch({
        type: 'CHANGE_INTEGRAL',
        payload: { integral },
      });
    },
    [dispatch],
  );
  const initialColumns: Array<CustomColumn<Integral>> = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
        style: { width: '30px', maxWidth: '30px' },
      },

      {
        index: 2,
        Header: 'From',
        sortType: 'basic',
        accessor: (row) => row.from.toFixed(2),
      },
      {
        index: 3,
        Header: 'To',
        sortType: 'basic',
        accessor: (row) => row.to.toFixed(2),
      },
      {
        index: 7,
        style: { width: '1%', maxWidth: '24px', minWidth: '24px' },
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
    [deleteIntegralHandler],
  );

  const saveRelativeHandler = useCallback(
    (event, row) => {
      dispatch({
        type: 'CHANGE_INTEGRAL_RELATIVE',
        payload: { value: event.target.value, id: row.id },
      });
    },
    [dispatch],
  );
  const integralsPreferences = usePanelPreferences('integrals', activeTab);

  const COLUMNS: Array<
    CustomColumn<Integral> & {
      showWhen: string;
    }
  > = useMemo(
    () => [
      {
        showWhen: 'absolute.show',
        index: 4,
        Header: 'Absolute',
        accessor: 'absolute',
        Cell: ({ row }) =>
          formatNumber(
            row.original.absolute,
            integralsPreferences.absolute.format,
          ),
      },
      {
        showWhen: 'relative.show',
        index: 5,
        id: 'relative',
        Header: () => {
          const n = activeTab?.replace(/\d/g, '');
          return <span>{`Relative ${n}`}</span>;
        },
        accessor: 'integral',
        Cell: ({ row }) => {
          const value = formatNumber(
            row.original.integral || 0,
            integralsPreferences.relative.format,
          );
          const flag = checkIntegralKind(row.original);
          const integral = flag ? value : `[ ${value} ]`;

          return (
            <EditableColumn
              key={`${integral}`}
              value={integral}
              onSave={(event) => saveRelativeHandler(event, row.original)}
              type="number"
              validate={(val) => val !== ''}
            />
          );
        },
      },
      {
        index: 6,
        Header: 'Kind',
        sortType: 'basic',
        resizable: true,
        accessor: 'kind',
        showWhen: 'showKind',
        Cell: ({ row }) => (
          <Select
            onChange={(value) => changeIntegralDataHandler(value, row)}
            items={signalKinds}
            style={selectStyle}
            defaultValue={row.original.kind}
          />
        ),
      },
    ],
    [
      activeTab,
      changeIntegralDataHandler,
      integralsPreferences,
      saveRelativeHandler,
      signalKinds,
    ],
  );

  const tableColumns = useMemo(() => {
    const columns = [...initialColumns];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (lodashGet(integralsPreferences, showWhen)) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [COLUMNS, initialColumns, integralsPreferences]);

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (!data || data.length === 0) {
    return <NoTableData />;
  }

  return <ReactTable data={data} columns={tableColumns} />;
}

export default memo(IntegralTable);
