import { Button, Classes } from '@blueprintjs/core';
import type { LegendField, PredefinedLegendField } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../../../context/ChartContext.js';
import { CheckController } from '../../../elements/CheckController.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { TanStackTableColumn } from '../../../elements/TanStackTable/TanStackTable.js';
import TanStackTable from '../../../elements/TanStackTable/TanStackTable.js';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString.js';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths.js';

function LegendsPreferences() {
  const { setValue, control, getValues } = useFormContext();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );

  const fields = useWatch({ name: 'legendsFields' });

  const addHandler = useCallback(
    (index: number) => {
      let columns: any[] = [];
      const emptyField = {
        jpath: null,
        visible: true,
      };
      const data = getValues('legendsFields');
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      setValue('legendsFields', columns);
    },
    [getValues, setValue],
  );

  const deleteHandler = useCallback(
    (index: number) => {
      const data = getValues('legendsFields');
      const _fields = data.filter(
        (_: any, columnIndex: any) => columnIndex !== index,
      );
      setValue('legendsFields', _fields);
    },
    [getValues, setValue],
  );

  const COLUMNS = useMemo<Array<TanStackTableColumn<LegendField>>>(
    () => [
      {
        header: '#',
        meta: { style: { width: '25px' } },
        accessorFn: (_, index) => index + 1,
      },
      {
        header: 'Field',
        cell: ({ row }) => {
          const predefinedColumn = row.original as PredefinedLegendField;
          if (predefinedColumn?.name) {
            return (
              <p style={{ padding: '5px 10px', margin: 0 }}>
                {predefinedColumn.label}
              </p>
            );
          }

          return (
            <Input2Controller
              control={control}
              name={`legendsFields.${row.index}.jpath`}
              filterItems={datalist}
              mapOnChangeValue={(key) => (paths as any)[key] || null}
              mapValue={convertPathArrayToString}
              style={{ backgroundColor: 'transparent' }}
              noShadowBox
            />
          );
        },
      },
      {
        header: 'Visible',
        meta: { style: { width: '30px', textAlign: 'center' } },
        cell: ({ row }) => (
          <CheckController
            control={control}
            style={{ margin: 0 }}
            name={`legendsFields.${row.index}.visible`}
          />
        ),
      },
      {
        header: '',
        meta: { style: { width: '70px' } },
        id: 'operation-button',
        cell: ({ row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                intent="success"
                variant="outlined"
                onClick={() => addHandler(row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                intent="danger"
                onClick={() => deleteHandler(row.index)}
                disabled={record?.name}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>
            </div>
          );
        },
      },
    ],
    [addHandler, control, datalist, deleteHandler, paths],
  );

  return (
    <TanStackTable
      data={fields}
      columns={COLUMNS}
      style={{ table: { height: '100%' } }}
    />
  );
}

export default LegendsPreferences;
