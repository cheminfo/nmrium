import { Button, Classes } from '@blueprintjs/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';
import type { CellProps } from 'react-table';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';

export function ExclusionsZonesTable() {
  const { setValue, control } = useFormContext<any>();
  const exclusionsZones = useWatch({ name: 'exclusionsZones' });
  if (!exclusionsZones || !Array.isArray(exclusionsZones)) {
    return null;
  }

  function handleDelete(index: any) {
    setValue(
      'exclusionsZones',
      exclusionsZones.filter((_: any, i: any) => i !== index),
    );
  }

  const exclusionsZonesColumns: Array<Column<any>> = [
    {
      Header: '#',
      style: { width: '50px' },
      accessor: (_: any, index) => index + 1,
    },
    {
      Header: 'from',
      Cell: ({ row }: CellProps<any>) => (
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
      Header: 'To',
      Cell: ({ row }: CellProps<any>) => (
        <NumberInput2Controller
          name={`exclusionsZones.${row.index}.to`}
          fill
          noShadowBox
          style={{ backgroundColor: 'transparent' }}
        />
      ),
    },

    {
      Header: '',
      style: { width: '70px' },
      id: 'actions',
      Cell: ({ row }: CellProps<any>) => {
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
  ];

  return (
    <ReactTable
      columns={exclusionsZonesColumns}
      data={exclusionsZones}
      emptyDataRowText="No Zones"
    />
  );
}
