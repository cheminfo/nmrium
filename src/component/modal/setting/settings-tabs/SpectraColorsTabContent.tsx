import { Classes } from '@blueprintjs/core';
import { SpectraColors } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, ColorPickerDropdown } from 'react-science/ui';

import { useChartData } from '../../../context/ChartContext';
import { GroupPane } from '../../../elements/GroupPane';
import { Input2 } from '../../../elements/Input2';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { useFormValidateField } from '../../../elements/useFormValidateField';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths';
import { Section } from '../GeneralSettings';

const colorInputStyle: CSSProperties = {
  minWidth: '80px',
  width: '80px',
};

type SpectraColorsKeys = keyof SpectraColors;

function getObjectKey(
  key: SpectraColorsKeys,
): `spectraColors.${SpectraColorsKeys}` {
  return `spectraColors.${key}`;
}

function getKeyPath(key: SpectraColorsKeys, index: number, fieldKey: string) {
  return `${getObjectKey(key)}.${index}.${fieldKey}`;
}

function SpectraColorsTabContent() {
  const { setValue } = useFormContext<WorkspaceWithSource>();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );
  const { oneDimension = [], twoDimensions = [] }: SpectraColors =
    useWatch<WorkspaceWithSource>({
      name: 'spectraColors',
    }) || {};

  const addHandler = useCallback(
    (data: readonly any[], index: number, key: SpectraColorsKeys) => {
      let columns: any[] = [];
      const emptyField =
        key === 'oneDimension'
          ? {
              value: '',
              jpath: ['info', 'experiment'],
              color: 'red',
            }
          : {
              value: '',
              jpath: ['info', 'experiment'],
              positiveColor: 'red',
              negativeColor: 'blue',
            };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      setValue(getObjectKey(key), columns);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number, key: SpectraColorsKeys) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setValue(getObjectKey(key), _fields);
    },
    [setValue],
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
  const { control } = useFormContext();
  const isValid = useFormValidateField();

  const COLUMNS: Array<Column<any>> = useMemo(() => {
    const baseColumns: Array<Column<any>> = [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'jpath');
          const isNotValid = !isValid(name);

          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <Input2
                    FilterItems={datalist}
                    onChange={(value) =>
                      field.onChange(() => {
                        return paths?.[value.toString().trim()] || value;
                      })
                    }
                    value={convertPathArrayToString(field.value)}
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                  />
                );
              }}
            />
          );
        },
      },
      {
        Header: 'Value',
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'value');
          const isNotValid = !isValid(name);

          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <Input2
                    {...field}
                    onChange={(v, e) => field.onChange(e)}
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                  />
                );
              }}
            />
          );
        },
      },
    ];

    const operationsField = {
      Header: '',
      style: { width: '60px' },
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
              <FaPlus className={Classes.ICON} />
            </Button>
            {!record?.name && (
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => onDelete(data, row.index, baseObjectPath)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
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
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'color');
          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <ColorPickerDropdown
                    onChangeComplete={({ hex }) => field.onChange(hex)}
                    color={{ hex: field.value }}
                  />
                );
              }}
            />
          );
        },
      };

      return [...baseColumns, colorField, operationsField];
    }

    const colorFields = [
      {
        Header: 'Positive color',
        style: colorInputStyle,
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'positiveColor');
          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <ColorPickerDropdown
                    onChangeComplete={({ hex }) => field.onChange(hex)}
                    color={{ hex: field.value }}
                  />
                );
              }}
            />
          );
        },
      },
      {
        Header: 'Negative color',
        style: colorInputStyle,
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'negativeColor');
          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <ColorPickerDropdown
                    onChangeComplete={({ hex }) => field.onChange(hex)}
                    color={{ hex: field.value }}
                  />
                );
              }}
            />
          );
        },
      },
    ];

    return [...baseColumns, ...colorFields, operationsField];
  }, [baseObjectPath, control, datalist, isValid, onAdd, onDelete, paths]);

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
    <Section>
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
    </Section>
  );
}

export default SpectraColorsTabContent;
