import { Classes } from '@blueprintjs/core';
import { ANALYSIS_COLUMN_TYPES } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { TanStackTableColumn } from '../../../elements/TanStackTable/TanStackTable.js';
import TanStackTable from '../../../elements/TanStackTable/TanStackTable.js';

export function AnalysisTablePreferences() {
  const { setValue, control, getValues } = useFormContext();
  const watchedAnalysisColumns = useWatch({ name: 'analysisOptions.columns' });
  const analysisColumns = useMemo(
    () => watchedAnalysisColumns ?? [],
    [watchedAnalysisColumns],
  );

  const addNewColumn = useCallback(
    (index: any) => {
      const columns = getValues('analysisOptions.columns') ?? [];
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
    [getValues, setValue],
  );

  const handleDelete = useCallback(
    (index: any) => {
      const columns = getValues('analysisOptions.columns') ?? [];
      setValue(
        'analysisOptions.columns',
        columns.filter((_: any, colIndex: any) => colIndex !== index),
      );
    },
    [getValues, setValue],
  );

  const COLUMNS = useMemo<Array<TanStackTableColumn<any>>>(() => {
    return [
      {
        id: 'rowNumber',
        header: '#',
        accessorFn: (_: any, index) => index + 1,
      },
      {
        header: 'Label',
        cell: ({ row }) => (
          <Input2Controller
            control={control}
            name={`analysisOptions.columns.${row.index}.tempKey`}
            style={{ backgroundColor: 'transparent' }}
            noShadowBox
          />
        ),
      },
      {
        header: 'Value',
        cell: ({ row }) => {
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
        header: '',
        meta: { style: { width: '70px' } },
        id: 'actions-button',
        cell: ({ row }) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                intent="success"
                variant="outlined"
                onClick={() => addNewColumn(row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                intent="danger"
                onClick={() => handleDelete(row.index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [addNewColumn, control, handleDelete]);

  return <TanStackTable columns={COLUMNS} data={analysisColumns} />;
}
