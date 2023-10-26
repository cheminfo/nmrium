import { useFormikContext } from 'formik';
import { AnalysisColumnsTypes } from 'nmr-load-save';
import { useMemo, useCallback } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../../elements/Button';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../elements/formik/FormikInput';

const inputStyle = { input: { width: '100%', fontSize: '1.15em' } };

export function AnalysisTablePreferences() {
  const {
    values: {
      analysisOptions: { columns },
    },
    setFieldValue,
  } = useFormikContext<any>();

  const addNewColumn = useCallback(
    (index, columns) => {
      void setFieldValue('analysisOptions.columns', [
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
    [setFieldValue],
  );

  const handleDelete = useCallback(
    (index, columns) => {
      void setFieldValue(
        'analysisOptions.columns',
        columns.filter((_, colIndex) => colIndex !== index),
      );
    },
    [setFieldValue],
  );

  const COLUMNS: Array<Column<any>> = useMemo(() => {
    return [
      {
        Header: '#',
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Label',
        Cell: ({ row }) => (
          <FormikInput
            name={`analysisOptions.columns.${row.index}.tempKey`}
            style={inputStyle}
          />
        ),
      },
      {
        Header: 'Value',
        Cell: ({ row }) => {
          const isFormulaColumn =
            row.original.type === AnalysisColumnsTypes.FORMULA;
          return (
            <FormikInput
              disabled={!isFormulaColumn}
              name={`analysisOptions.columns.${row.index}.formula`}
              style={inputStyle}
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '50px' },
        id: 'add-button',
        Cell: ({ data, row }) => {
          return (
            <div style={{ display: 'flex' }}>
              <Button.Danger
                fill="outline"
                onClick={() => handleDelete(row.index, data)}
              >
                <FaTimes />
              </Button.Danger>
              {data.length === row.index + 1 && (
                <Button.Done
                  fill="outline"
                  onClick={() => addNewColumn(row.index + 1, data)}
                >
                  <FaPlus />
                </Button.Done>
              )}
            </div>
          );
        },
      },
    ];
  }, [addNewColumn, handleDelete]);

  return <ReactTable columns={COLUMNS} data={columns} />;
}
