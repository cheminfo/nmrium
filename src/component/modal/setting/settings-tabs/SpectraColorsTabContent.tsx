import { Classes } from '@blueprintjs/core';
import type { SpectraColors } from 'nmrium-core';
import type { CSSProperties } from 'react';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { useChartData } from '../../../context/ChartContext.js';
import { ColorPickerDropdownController } from '../../../elements/ColorPickerDropdownController.js';
import { GroupPane } from '../../../elements/GroupPane.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import Label from '../../../elements/Label.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString.js';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths.js';
import { Section, settingLabelStyle } from '../GeneralSettings.js';

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
  const { setValue, control, watch } = useFormContext<WorkspaceWithSource>();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );
  const { oneDimension = [], twoDimensions = [] }: SpectraColors =
    watch('spectraColors') || {};

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
      <Label title="Assignment highlight color " style={settingLabelStyle}>
        <div style={colorInputStyle}>
          <ColorPickerDropdownController
            control={control}
            name="spectraColors.highlightColor"
          />
        </div>
      </Label>
      <Label title="Indicator line color " style={settingLabelStyle}>
        <div style={colorInputStyle}>
          <ColorPickerDropdownController
            control={control}
            name="spectraColors.indicatorLineColor"
          />
        </div>
      </Label>

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

  const COLUMNS: Column[] = useMemo(() => {
    const baseColumns: Column[] = [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'jpath');
          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              filterItems={datalist}
              mapOnChangeValue={(value) => paths?.[value.trim()] || value}
              mapValue={convertPathArrayToString}
              style={{ backgroundColor: 'transparent' }}
            />
          );
        },
      },
      {
        Header: 'Value',
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'value');

          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
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
              size="small"
              variant="outlined"
              intent="success"
              tooltipProps={{ content: '', disabled: true }}
              onClick={() => onAdd(data, row.index + 1, baseObjectPath)}
            >
              <FaPlus className={Classes.ICON} />
            </Button>
            {!record?.name && (
              <Button
                size="small"
                variant="outlined"
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
            <ColorPickerDropdownController control={control} name={name} />
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
            <ColorPickerDropdownController control={control} name={name} />
          );
        },
      },
      {
        Header: 'Negative color',
        style: colorInputStyle,
        Cell: ({ row }) => {
          const name = getKeyPath(baseObjectPath, row.index, 'negativeColor');
          return (
            <ColorPickerDropdownController control={control} name={name} />
          );
        },
      },
    ];

    return [...baseColumns, ...colorFields, operationsField];
  }, [baseObjectPath, control, datalist, onAdd, onDelete, paths]);

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
        size="small"
        variant="outlined"
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
