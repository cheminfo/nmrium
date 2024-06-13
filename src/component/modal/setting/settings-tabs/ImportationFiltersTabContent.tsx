import { Checkbox } from '@blueprintjs/core';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Keys } from '../../../../data/types/common/Keys';
import { GroupPane } from '../../../elements/GroupPane';
import { Input2 } from '../../../elements/Input2';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { Select2 } from '../../../elements/Select2';
import { useFormValidateField } from '../../../elements/useFormValidateField';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';

const DataSelectionOptions = [
  { label: 'FT', value: 'ft' },
  { label: 'FID', value: 'fid' },
  { label: 'Both', value: 'both' },
  { label: 'Prefer FT', value: 'preferFT' },
  { label: 'Prefer FID', value: 'preferFID' },
];

interface BaseListItem {
  label: string;
  name: Partial<Keys<Pick<WorkspaceWithSource, 'nmrLoaders'>>>;
}

interface BasicListItem extends BaseListItem {
  fieldType: 'input' | 'checkbox';
}
interface SelectListItem extends BaseListItem {
  fieldType: 'select';
  options: any[];
}

type ListItem = BasicListItem | SelectListItem;

const GENERAL_LIST: ListItem[] = [
  {
    label: 'Keep 1D',
    name: 'nmrLoaders.general.keep1D',
    fieldType: 'checkbox',
  },
  {
    label: 'Keep 2D',
    name: 'nmrLoaders.general.keep2D',
    fieldType: 'checkbox',
  },
  {
    label: 'Only Real',
    name: 'nmrLoaders.general.onlyReal',
    fieldType: 'checkbox',
  },
  {
    label: 'Data Selection',
    name: 'nmrLoaders.general.dataSelection',
    fieldType: 'select',
    options: DataSelectionOptions,
  },
];

const BRUKER_LIST: ListItem[] = [
  {
    label: 'Processing Numbers',
    name: 'nmrLoaders.bruker.processingNumbers',
    fieldType: 'input',
  },
  {
    label: 'Experiment Numbers',
    name: 'nmrLoaders.bruker.experimentNumbers',
    fieldType: 'input',
  },
  {
    label: 'Only First Processed Data',
    name: 'nmrLoaders.bruker.onlyFirstProcessedData',
    fieldType: 'checkbox',
  },
];

function ImportationFiltersTabContent() {
  const { register, control } = useFormContext<WorkspaceWithSource>();
  const isValid = useFormValidateField();

  const COLUMNS: Array<Column<ListItem>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '10px' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Feature',
        accessor: 'label',
        style: { width: '70%' },
      },
      {
        Header: ' ',
        style: { textAlign: 'center' },
        Cell: ({ row }) => {
          const fieldType = row.original.fieldType;
          const name = row.original.name;
          switch (fieldType) {
            case 'checkbox':
              return <Checkbox style={{ margin: 0 }} {...register(name)} />;
            case 'input': {
              const isNotValid = !isValid(name);

              return (
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => {
                    const { onChange, value, ...otherProps } = field;
                    return (
                      <Input2
                        {...otherProps}
                        value={value as string}
                        fill
                        onChange={(v, e) => onChange(e)}
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
            }

            case 'select': {
              const data = row.original;
              return (
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => {
                    const { onChange, value, ...otherProps } = field;

                    return (
                      <Select2
                        {...otherProps}
                        items={data.options}
                        itemTextKey="label"
                        itemValueKey="value"
                        selectedItemValue={field.value}
                        onItemSelect={(item) => field.onChange(item.value)}
                        fill
                      />
                    );
                  }}
                />
              );
            }
            default:
              return <span />;
          }
        },
      },
    ],
    [control, isValid, register],
  );

  return (
    <>
      <GroupPane text="General">
        <ReactTable
          columns={COLUMNS}
          data={GENERAL_LIST}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
          }}
        />
      </GroupPane>
      <GroupPane text="Bruker">
        <ReactTable
          columns={COLUMNS}
          data={BRUKER_LIST}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
          }}
        />
      </GroupPane>
    </>
  );
}

export default ImportationFiltersTabContent;
