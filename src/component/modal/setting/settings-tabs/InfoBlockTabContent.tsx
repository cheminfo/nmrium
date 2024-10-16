import { Checkbox, Classes } from '@blueprintjs/core';
import { InfoBlockField } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { useChartData } from '../../../context/ChartContext.js';
import { GroupPane } from '../../../elements/GroupPane.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import Label from '../../../elements/Label.js';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable.js';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString.js';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths.js';
import { Section } from '../GeneralSettings.js';

function getKeyPath<T extends keyof InfoBlockField>(
  index: number,
  key: T,
): `infoBlock.fields.${number}.${T}` {
  return `infoBlock.fields.${index}.${key}`;
}

function InfoBlockTabContent() {
  const { control, setValue, register } = useFormContext<WorkspaceWithSource>();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );
  const fields: InfoBlockField[] =
    useWatch<WorkspaceWithSource>({
      name: 'infoBlock.fields',
    }) || [];

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: any[] = [];
      const emptyField = {
        label: '',
        jpath: null,
        visible: true,
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      setValue('infoBlock.fields', columns);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setValue('infoBlock.fields', _fields);
    },
    [setValue],
  );

  const COLUMNS: Column[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Label',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'label');
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
      {
        Header: 'Field',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'jpath');
          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              filterItems={datalist}
              mapOnChangeValue={(value) => paths?.[value.trim()] || value}
              mapValue={convertPathArrayToString}
            />
          );
        },
      },
      {
        Header: 'Format',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'format');
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
      {
        Header: 'Visible',
        style: { width: '30px', textAlign: 'center' },
        Cell: ({ row }) => (
          <Checkbox
            style={{ margin: 0 }}
            {...register(getKeyPath(row.index, 'visible'))}
          />
        ),
      },
      {
        Header: '',
        style: { width: '60px' },
        id: 'add-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                small
                intent="success"
                outlined
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              {!record?.name && (
                <Button
                  small
                  outlined
                  intent="danger"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [addHandler, control, datalist, deleteHandler, paths, register],
  );

  return (
    <div>
      <Label
        title="Display spectrum info block"
        style={{ wrapper: { padding: '10px 0' } }}
      >
        <Checkbox style={{ margin: 0 }} {...register('infoBlock.visible')} />
      </Label>

      <GroupPane
        text="Fields"
        renderHeader={(text) => {
          return (
            <FieldsBlockHeader
              text={text}
              onAdd={() => addHandler(fields, 0)}
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
          data={fields}
          columns={COLUMNS}
          emptyDataRowText="No Fields"
        />
      </GroupPane>
    </div>
  );
}

function FieldsBlockHeader({ onAdd, text }) {
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>

      <Button
        outlined
        small
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add Field
      </Button>
    </Section>
  );
}

export default InfoBlockTabContent;
