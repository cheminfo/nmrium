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
import TanStackTable from '../../elements/TanStackTable/TanStackTable.js';
import type { ControlCustomColumn } from '../../elements/TanStackTable/utility/addCustomColumn.js';
import {
  createActionColumn,
  getTableColumns,
} from '../../elements/TanStackTable/utility/addCustomColumn.js';
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

  const COLUMNS = useMemo<Array<ControlCustomColumn<Integral>>>(
    () => [
      {
        showWhen: 'showSerialNumber',
        index: 1,
        id: 'rowNumber',
        header: '#',
        accessorFn: (_, index) => index + 1,
        meta: { style: { width: '30px', maxWidth: '30px' } },
      },
      {
        showWhen: 'from.show',
        index: 2,
        header: 'From',
        sortFn: 'basic',
        accessorFn: (row) =>
          formatNumber(row.from, integralsPreferences.from.format),
      },
      {
        showWhen: 'to.show',
        index: 3,
        header: 'To',
        sortFn: 'basic',
        accessorFn: (row) =>
          formatNumber(row.to, integralsPreferences.to.format),
      },
      {
        showWhen: 'absolute.show',
        index: 4,
        header: 'Absolute',
        accessorFn: (row) =>
          formatNumber(row.absolute, integralsPreferences.absolute.format),
      },
      {
        showWhen: 'relative.show',
        index: 5,
        id: 'relative',
        header: () => {
          const n = activeTab?.replaceAll(/\d/g, '');
          return <span>{`Relative ${n}`}</span>;
        },
        accessorKey: 'integral',
        cell: ({ row }) => {
          const value = formatNumber(
            row.original.integral || 0,
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
      },
      {
        index: 6,
        header: 'Kind',
        sortFn: 'basic',
        accessorKey: 'kind',
        showWhen: 'showKind',
        cell: ({ row }) => (
          <Select
            onChange={(value) =>
              changeIntegralDataHandler(value as SignalKind, row.original)
            }
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
          id: 'delete-action',
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
    return getTableColumns(COLUMNS, (showWhen) =>
      dlv(integralsPreferences, showWhen),
    );
  }, [COLUMNS, integralsPreferences]);

  if (info.isFid) {
    return <NoDataForFid />;
  }

  if (data.length === 0) {
    return <EmptyText text="No data" />;
  }

  return <TanStackTable data={data} columns={tableColumns} />;
}

export default memo(IntegralTable);
