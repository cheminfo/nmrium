import { useFormikContext } from 'formik';
import { SpectraColors, Workspace } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import { useChartData } from '../../../context/ChartContext';
import Button from '../../../elements/Button';
import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikColorPickerDropdown from '../../../elements/formik/FormikColorPickerDropdown';
import FormikInput from '../../../elements/formik/FormikInput';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
  },
  column: {
    padding: '2px',
  },
};

const colorInputStyle: CSSProperties = {
  padding: 0,
  minWidth: '80px',
  width: '80px',
  ...styles.column,
};

type SpectraColorsKeys = keyof SpectraColors;

function getObjectKey(key: SpectraColorsKeys) {
  return `spectraColors.${key}`;
}

function SpectraColorsTabContent() {
  const { values, setFieldValue } = useFormikContext<Workspace>();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );
  const { oneDimension = [], twoDimensions = [] } = values?.spectraColors || {};

  const addHandler = useCallback(
    (data: readonly any[], index: number, key: SpectraColorsKeys) => {
      let columns: any[] = [];
      const emptyField =
        key === 'oneDimension'
          ? {
              value: null,
              jpath: ['info', 'experiment'],
              color: 'red',
            }
          : {
              value: null,
              jpath: ['info', 'experiment'],
              positiveColor: 'red',
              negativeColor: 'blue',
            };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      void setFieldValue(getObjectKey(key), columns);
    },
    [setFieldValue],
  );

  const deleteHandler = useCallback(
    (data, index: number, key: SpectraColorsKeys) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue(getObjectKey(key), _fields);
    },
    [setFieldValue],
  );

  return (
    <div>
      <SpectraColorsFields
        groupLabel="One dimension"
        baseObjectPath="oneDimension"
        data={oneDimension}
        datalist={datalist}
        paths={paths}
        onAdd={addHandler}
        onDelete={deleteHandler}
      />
      <SpectraColorsFields
        groupLabel="Two dimensions"
        baseObjectPath="twoDimensions"
        data={twoDimensions}
        datalist={datalist}
        paths={paths}
        onAdd={addHandler}
        onDelete={deleteHandler}
      />
    </div>
  );
}

interface SpectraColorsProps {
  data: any;
  onAdd: (data: any, index: number, key: SpectraColorsKeys) => void;
  onDelete: (data: any, index: number, key: SpectraColorsKeys) => void;
  datalist: string[];
  paths: Record<string, string[]>;
  baseObjectPath: SpectraColorsKeys;
  groupLabel: string;
}
function SpectraColorsFields(props: SpectraColorsProps) {
  const { onAdd, onDelete, datalist, paths, data, baseObjectPath, groupLabel } =
    props;

  const COLUMNS: Array<Column<any>> = useMemo(() => {
    const objectPath = getObjectKey(baseObjectPath);
    const baseColumns = [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`${objectPath}.${row.index}.jpath`}
              style={{ input: styles.input }}
              mapOnChangeValue={(key) => {
                return paths?.[key.toString().trim()] || key;
              }}
              mapValue={(paths) => convertPathArrayToString(paths)}
              datalist={datalist}
            />
          );
        },
      },
      {
        Header: 'Value',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`${objectPath}.${row.index}.value`}
              style={{ input: styles.input }}
            />
          );
        },
      },
    ];

    const operationsField = {
      Header: '',
      style: { width: '70px', ...styles.column },
      id: 'operation-button',
      Cell: ({ data, row }) => {
        const record: any = row.original;
        return (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button.Done
              fill="outline"
              onClick={() => onAdd(data, row.index + 1, baseObjectPath)}
            >
              <FaPlus />
            </Button.Done>
            {!record?.name && (
              <Button.Danger
                fill="outline"
                onClick={() => onDelete(data, row.index, baseObjectPath)}
              >
                <FaTimes />
              </Button.Danger>
            )}
          </div>
        );
      },
    };

    if (baseObjectPath === 'oneDimension') {
      const colorField = {
        Header: 'Color',
        style: colorInputStyle,
        Cell: ({ row }) => (
          <FormikColorPickerDropdown
            name={`${objectPath}.${row.index}.color`}
          />
        ),
      };

      return [...baseColumns, colorField, operationsField];
    }

    const colorFields = [
      {
        Header: 'Positive color',
        style: colorInputStyle,
        Cell: ({ row }) => (
          <FormikColorPickerDropdown
            name={`${objectPath}.${row.index}.positiveColor`}
          />
        ),
      },
      {
        Header: 'Negative color',
        style: colorInputStyle,
        Cell: ({ row }) => (
          <FormikColorPickerDropdown
            name={`${objectPath}.${row.index}.negativeColor`}
          />
        ),
      },
    ];

    return [...baseColumns, ...colorFields, operationsField];
  }, [baseObjectPath, datalist, onAdd, onDelete, paths]);

  return (
    <GroupPane
      text={groupLabel}
      renderHeader={(text) => {
        return (
          <FieldsBlockHeader
            text={text}
            onAdd={() => onAdd(data, 0, baseObjectPath)}
          />
        );
      }}
    >
      <ReactTable
        style={{
          'table, table td, table th': { border: 'none' },
          'table thead': { borderBottom: '1px solid #f9f9f9' },
        }}
        data={data}
        columns={COLUMNS}
        emptyDataRowText="No Fields"
      />
    </GroupPane>
  );
}

function FieldsBlockHeader({ onAdd, text }) {
  return (
    <div className="section-header" style={{ display: 'flex' }}>
      <p style={{ flex: 1 }}>{text}</p>

      <Button.Done fill="outline" size="xSmall" onClick={onAdd}>
        Add custom color
      </Button.Done>
    </div>
  );
}

export default SpectraColorsTabContent;
