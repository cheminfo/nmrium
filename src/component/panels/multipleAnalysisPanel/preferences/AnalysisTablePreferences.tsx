import { Classes } from '@blueprintjs/core';
import { ANALYSIS_COLUMN_TYPES } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import type { CellProps } from 'react-table';

import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';

export function AnalysisTablePreferences() {
  const { setValue, control } = useFormContext();
  const columns = useWatch({ name: 'analysisOptions.columns' });

  const addNewColumn = useCallback(
    (index: any, columns: any) => {
      setValue('analysisOptions.columns', [
        ...columns,
        {
          tempKey: '',
          type: 'FORMULA',
          valueKey: 'value',
          formula: '',
          index,
        },
      ]);
    },
    [setValue],
  );

  const handleDelete = useCallback(
    (index: any, columns: any) => {
      setValue(
        'analysisOptions.columns',
        columns.filter((_: any, colIndex: any) => colIndex !== index),
      );
    },
    [setValue],
  );

  const COLUMNS = useMemo<Array<Column<any>>>(() => {
    return [
      {
        Header: '#',
        accessor: (_: any, index) => index + 1,
      },
      {
        Header: 'Label',
        Cell: ({ row }: CellProps<any>) => (
          <Input2Controller
            control={control}
            name={`analysisOptions.columns.${row.index}.tempKey`}
            style={{ backgroundColor: 'transparent' }}
            noShadowBox
          />
        ),
      },
      {
        Header: 'Value',
        Cell: ({ row }: CellProps<any>) => {
          const isFormulaColumn =
            row.original.type === ANALYSIS_COLUMN_TYPES.FORMULA;
          return (
            <Input2Controller
              control={control}
              disabled={!isFormulaColumn}
              name={`analysisOptions.columns.${row.index}.formula`}
              style={{ backgroundColor: 'transparent' }}
              noShadowBox
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '70px' },
        id: 'actions-button',
        Cell: ({ data, row }: CellProps<any>) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                intent="success"
                variant="outlined"
                onClick={() => addNewColumn(row.index + 1, data)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                intent="danger"
                onClick={() => handleDelete(row.index, data)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [addNewColumn, control, handleDelete]);

  return <ReactTable columns={COLUMNS} data={columns} />;
}
