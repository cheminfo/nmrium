/** @jsxImportSource @emotion/react */
import { Button, Classes } from '@blueprintjs/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';

export function ExclusionsZonesTable() {
  const { setValue, control } = useFormContext<any>();
  const exclusionsZones = useWatch({ name: 'exclusionsZones' });
  if (!exclusionsZones || !Array.isArray(exclusionsZones)) {
    return null;
  }

  function handleDelete(index) {
    setValue(
      'exclusionsZones',
      exclusionsZones.filter((_, i) => i !== index),
    );
  }

  const exclusionsZonesColumns: Column[] = [
    {
      Header: '#',
      style: { width: '50px' },
      accessor: (_, index) => index + 1,
    },
    {
      Header: 'from',
      Cell: ({ row }) => (
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
      Cell: ({ row }) => (
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
      Cell: ({ row }) => {
        return (
          <Button
            small
            outlined
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
