import lodashGet from 'lodash/get';
import { Info1D, Integral } from 'nmr-processing';
import { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../data/constants/signalsKinds';
import { checkIntegralKind } from '../../../data/data1d/Spectrum1D';
import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
  createActionColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import Select from '../../elements/Select';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { formatNumber } from '../../utility/formatNumber';
import NoDataForFid from '../extra/placeholder/NoDataForFid';
import NoTableData from '../extra/placeholder/NoTableData';

import { IntegralPanelInnerProps } from './IntegralPanel';

const selectStyle = { width: '100%', border: 'none' };

interface IntegralTableProps
  extends Pick<IntegralPanelInnerProps, 'activeTab'> {
  data: Integral[];
  info: Info1D;
}

function IntegralTable({ activeTab, data, info }: IntegralTableProps) {
  const dispatch = useDispatch();

  const deleteIntegralHandler = useCallback(
    (row) => {
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
        showWhen: 'showSerialNumber',
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
        style: { width: '30px', maxWidth: '30px' },
      },
      {
        showWhen: 'from.show',
        index: 2,
        Header: 'From',
        sortType: 'basic',
        accessor: (row) =>
          formatNumber(row.from, integralsPreferences.from.format),
      },
      {
        showWhen: 'to.show',
        index: 3,
        Header: 'To',
        sortType: 'basic',
        accessor: (row) => formatNumber(row.to, integralsPreferences.to.format),
      },
      {
        showWhen: 'absolute.show',
        index: 4,
        Header: 'Absolute',
        accessor: (row) =>
          formatNumber(row.absolute, integralsPreferences.absolute.format),
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
            items={SIGNAL_KINDS}
            style={selectStyle}
            defaultValue={row.original.kind}
          />
        ),
      },
      {
        showWhen: 'showDeleteAction',
        ...createActionColumn<Integral>({
          index: 20,
          icon: <FaRegTrashAlt />,
          onClick: deleteIntegralHandler,
        }),
      },
    ],
    [
      activeTab,
      changeIntegralDataHandler,
      integralsPreferences,
      saveRelativeHandler,
      deleteIntegralHandler,
    ],
  );

  const tableColumns = useMemo(() => {
    const columns: Array<CustomColumn<Integral>> = [];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (lodashGet(integralsPreferences, showWhen)) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [COLUMNS, integralsPreferences]);

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (!data || data.length === 0) {
    return <NoTableData />;
  }

  return <ReactTable data={data} columns={tableColumns} />;
}

export default memo(IntegralTable);
