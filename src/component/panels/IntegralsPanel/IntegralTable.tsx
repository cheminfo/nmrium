import type { Info1D, Integral, SignalKind } from '@zakodium/nmr-types';
import dlv from 'dlv';
import { checkIntegralKind } from 'nmr-processing';
import { memo, useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../data/constants/signalsKinds.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { EditableColumn } from '../../elements/EditableColumn.js';
import { EmptyText } from '../../elements/EmptyText.js';
import Select from '../../elements/Select.js';
import {
  TanStackTable,
  createActionColumn,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.ts';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { formatNumber } from '../../utility/formatNumber.js';
import { NoDataForFid } from '../extra/placeholder/NoDataForFid.js';

import type { IntegralPanelInnerProps } from './IntegralPanel.js';

const selectStyle = { width: '100%', border: 'none' };

interface IntegralTableProps extends Pick<
  IntegralPanelInnerProps,
  'activeTab'
> {
  data: Integral[];
  info: Info1D;
}

function IntegralTable(props: IntegralTableProps) {
  const { activeTab, data, info } = props;
  const dispatch = useDispatch();

  const deleteIntegralHandler = useCallback(
    (integral: Integral) => {
      const { id } = integral;
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
    (kind: SignalKind, integral: Integral) => {
      dispatch({
        type: 'CHANGE_INTEGRAL',
        payload: { integral: { ...integral, kind } },
      });
    },
    [dispatch],
  );

  const saveRelativeHandler = useCallback(
    (value: string | number, integral: Integral) => {
      dispatch({
        type: 'CHANGE_INTEGRAL_RELATIVE',
        payload: { value: Number(value), id: integral.id },
      });
    },
    [dispatch],
  );
  const integralsPreferences = usePanelPreferences('integrals', activeTab);

  const COLUMNS = useMemo(() => {
    const columnHelper = createTanStackColumnHelper<Integral>();
    const columns = columnHelper.columns([]);
    // TODO: Use column visibility feature instead.
    if (dlv(integralsPreferences, 'showSerialNumber')) {
      columns.push({
        id: 'rowNumber',
        header: '#',
        accessorFn: (_, index) => index + 1,
        meta: { style: { width: '30px', maxWidth: '30px' } },
      });
    }
    if (dlv(integralsPreferences, 'from.show')) {
      columns.push({
        header: 'From',
        sortFn: 'basic',
        accessorKey: 'from',
        cell: ({ getValue }) =>
          formatNumber(getValue(), integralsPreferences.from.format),
      });
    }
    if (dlv(integralsPreferences, 'to.show')) {
      columns.push({
        header: 'To',
        sortFn: 'basic',
        accessorKey: 'to',
        cell: ({ getValue }) =>
          formatNumber(getValue(), integralsPreferences.to.format),
      });
    }
    if (dlv(integralsPreferences, 'absolute.show')) {
      columns.push({
        header: 'Absolute',
        accessorKey: 'absolute',
        cell: ({ getValue }) =>
          formatNumber(getValue(), integralsPreferences.absolute.format),
      });
    }
    if (dlv(integralsPreferences, 'relative.show')) {
      columns.push({
        id: 'relative',
        header: () => {
          const n = activeTab?.replaceAll(/\d/g, '');
          return <span>{`Relative ${n}`}</span>;
        },
        accessorKey: 'integral',
        cell: ({ getValue, row }) => {
          const value = formatNumber(
            getValue() || 0,
            integralsPreferences.relative.format,
          );
          const flag = checkIntegralKind(row.original);
          const integral = flag ? value : `[ ${value} ]`;

          return (
            <EditableColumn
              key={integral}
              value={integral}
              onSave={(value) => saveRelativeHandler(value, row.original)}
              type="number"
              validate={(val) => val !== ''}
            />
          );
        },
      });
    }
    if (dlv(integralsPreferences, 'showKind')) {
      columns.push({
        header: 'Kind',
        sortFn: 'basic',
        accessorKey: 'kind',
        cell: ({ getValue, row }) => (
          <Select
            onChange={(value) =>
              changeIntegralDataHandler(value as SignalKind, row.original)
            }
            items={SIGNAL_KINDS}
            style={selectStyle}
            defaultValue={getValue()}
          />
        ),
      });
    }
    if (dlv(integralsPreferences, 'showDeleteAction')) {
      columns.push(
        createActionColumn<Integral>({
          id: 'delete-action',
          icon: <FaRegTrashAlt />,
          onClick: deleteIntegralHandler,
        }),
      );
    }
    return columns;
  }, [
    activeTab,
    changeIntegralDataHandler,
    integralsPreferences,
    saveRelativeHandler,
    deleteIntegralHandler,
  ]);

  if (info.isFid) {
    return <NoDataForFid />;
  }

  if (data.length === 0) {
    return <EmptyText text="No data" />;
  }

  return <TanStackTable data={data} columns={COLUMNS} />;
}

export default memo(IntegralTable);
