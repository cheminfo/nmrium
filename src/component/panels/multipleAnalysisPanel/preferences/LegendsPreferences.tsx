import { Button, Classes } from '@blueprintjs/core';
import type { LegendField, PredefinedLegendField } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../../../context/ChartContext.js';
import { CheckController } from '../../../elements/CheckController.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString.js';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths.js';

function LegendsPreferences() {
  const { setValue, control } = useFormContext();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );

  const fields = useWatch({ name: 'legendsFields' });

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: any[] = [];
      const emptyField = {
        jpath: null,
        visible: true,
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      setValue('legendsFields', columns);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setValue('legendsFields', _fields);
    },
    [setValue],
  );

  const COLUMNS: Array<Column<LegendField>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        Cell: ({ row }) => {
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
              mapOnChangeValue={(key) => paths?.[key] || null}
              mapValue={convertPathArrayToString}
              style={{ backgroundColor: 'transparent' }}
              noShadowBox
            />
          );
        },
      },
      {
        Header: 'Visible',
        style: { width: '30px', textAlign: 'center' },
        Cell: ({ row }) => (
          <CheckController
            control={control}
            style={{ margin: 0 }}
            name={`legendsFields.${row.index}.visible`}
          />
        ),
      },
      {
        Header: '',
        style: { width: '70px' },
        id: 'operation-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                intent="success"
                variant="outlined"
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                intent="danger"
                onClick={() => deleteHandler(data, row.index)}
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
    <ReactTable
      data={fields}
      columns={COLUMNS}
      style={{ table: { height: '100%' } }}
    />
  );
}

export default LegendsPreferences;
