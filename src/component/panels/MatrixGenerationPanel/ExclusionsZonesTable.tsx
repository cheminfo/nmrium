import { Button, Classes } from '@blueprintjs/core';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import {
  TanStackTable,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.ts';

export function ExclusionsZonesTable() {
  const { setValue, control, getValues } = useFormContext<any>();
  const exclusionsZones = useWatch({ name: 'exclusionsZones' });

  const handleDelete = useCallback(
    (index: number) => {
      setValue(
        'exclusionsZones',
        getValues('exclusionsZones').filter((_: any, i: number) => i !== index),
      );
    },
    [getValues, setValue],
  );

  const exclusionsZonesColumns = useMemo(() => {
    const columnHelper = createTanStackColumnHelper<any>();
    return columnHelper.columns([
      {
        header: '#',
        meta: { style: { width: '50px' } },
        accessorFn: (_, index) => index + 1,
      },
      {
        header: 'From',
        cell: ({ row }) => (
          <NumberInput2Controller
            control={control}
            name={`exclusionsZones.${row.index}.from`}
            fill
            noShadowBox
            style={{ backgroundColor: 'transparent' }}
          />
        ),
      },
      {
        header: 'To',
        cell: ({ row }) => (
          <NumberInput2Controller
            name={`exclusionsZones.${row.index}.to`}
            fill
            noShadowBox
            style={{ backgroundColor: 'transparent' }}
          />
        ),
      },
      {
        header: '',
        meta: { style: { width: '70px' } },
        id: 'actions',
        cell: ({ row }) => {
          return (
            <Button
              size="small"
              variant="outlined"
              intent="danger"
              onClick={() => handleDelete(row.index)}
            >
              <FaRegTrashAlt className={Classes.ICON} />
            </Button>
          );
        },
      },
    ]);
  }, [control, handleDelete]);

  if (!exclusionsZones || !Array.isArray(exclusionsZones)) {
    return null;
  }

  return (
    <TanStackTable
      columns={exclusionsZonesColumns}
      data={exclusionsZones}
      emptyDataRowText="No Zones"
    />
  );
}
