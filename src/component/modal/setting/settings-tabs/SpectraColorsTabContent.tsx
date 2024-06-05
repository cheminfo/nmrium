import { useFormikContext } from 'formik';
import { SpectraColors, Workspace } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../../../context/ChartContext';
import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { tableInputStyle } from '../../../elements/ReactTable/Style';
import FormikColorPickerDropdown from '../../../elements/formik/FormikColorPickerDropdown';
import FormikInput from '../../../elements/formik/FormikInput';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths';
import { Button } from 'react-science/ui';

const colorInputStyle: CSSProperties = {
  minWidth: '80px',
  width: '80px',
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
    const baseColumns: Array<Column<any>> = [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`${objectPath}.${row.index}.jpath`}
              style={tableInputStyle}
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
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`${objectPath}.${row.index}.value`}
              style={tableInputStyle}
            />
          );
        },
      },
    ];

    const operationsField = {
      Header: '',
      style: { width: '70px' },
      id: 'operation-button',
      Cell: ({ data, row }) => {
        const record: any = row.original;
        return (
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <Button
              small
              outlined
              intent="success"
              tooltipProps={{ content: '', disabled: true }}
              onClick={() => onAdd(data, row.index + 1, baseObjectPath)}
            >
              <FaPlus />
            </Button>
            {!record?.name && (
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => onDelete(data, row.index, baseObjectPath)}
              >
                <FaRegTrashAlt />
              </Button>
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
          'thead tr th': { zIndex: 1 },
          td: { padding: 0 },
        }}
        rowStyle={{
          hover: { backgroundColor: '#f7f7f7' },
          active: { backgroundColor: '#f5f5f5' },
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

      <Button
        small
        outlined
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add custom color
      </Button>
    </div>
  );
}

export default SpectraColorsTabContent;
