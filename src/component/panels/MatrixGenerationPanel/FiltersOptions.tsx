/** @jsxImportSource @emotion/react */
import { Button, Classes } from '@blueprintjs/core';
import { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import {
  getMatrixFilters,
  MatrixFilter,
  normalCase,
} from '../../../data/matrixGeneration.js';
import { CheckController } from '../../elements/CheckController.js';
import { GroupPane } from '../../elements/GroupPane.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../elements/Select2Controller.js';

import {
  DEFAULT_MATRIX_FILTERS,
  GroupPanelStyle,
} from './MatrixGenerationPanel.js';

interface SelectMatrixFilter extends MatrixFilter {
  label: string;
}

const matrixFilters: SelectMatrixFilter[] = getMatrixFilters().map((item) => ({
  ...item,
  label: normalCase(item.name),
}));

export function FiltersOptions() {
  const filters = useWatch({ name: 'filters' });

  if (!filters || !Array.isArray(filters)) {
    return null;
  }

  return filters.map((filter, index) => {
    return (
      <GroupPane
        // eslint-disable-next-line react/no-array-index-key
        key={`${index}`}
        text={`${index + 1} - ${normalCase(filter.name)} options`}
        style={{ ...GroupPanelStyle, container: { padding: 0 } }}
        renderHeader={(text) => (
          <FiltersPanelGroupHeader {...{ index, text, name: filter.name }} />
        )}
      >
        <Fields filter={filter} basePath={`filters.${index}`} />
      </GroupPane>
    );
  });
}

function Fields(props: { filter: MatrixFilter; basePath: string }) {
  const fields = Object.entries(props.filter.properties);
  const { control } = useFormContext();

  return (
    <div>
      {fields.map(([key, field]) => {
        const keyPath = `${props.basePath}.options.${key}`;
        switch (field.type) {
          case 'label': {
            const fieldsGroupName = key.split('.')?.[field.level] || '';

            return (
              <Label
                key={key}
                title={normalCase(fieldsGroupName)}
                style={{
                  label: { fontWeight: 'bold' },
                  container: {
                    paddingLeft: `${10 * field.level}px`,
                    paddingTop: '10px',
                  },
                }}
              >
                <span />
              </Label>
            );
          }
          case 'string': {
            return (
              <LevelLabel field={field}>
                <Input2Controller
                  control={control}
                  name={keyPath}
                  placeholder={field.default}
                />
              </LevelLabel>
            );
          }
          case 'number': {
            return (
              <LevelLabel field={field}>
                <NumberInput2Controller
                  control={control}
                  name={keyPath}
                  placeholder={`${field.default}`}
                />
              </LevelLabel>
            );
          }
          case 'boolean': {
            return (
              <LevelLabel field={field}>
                <CheckController control={control} name={keyPath} />
              </LevelLabel>
            );
          }
          case 'select': {
            return (
              <LevelLabel field={field}>
                <Select2Controller
                  control={control}
                  items={mapSelectList(field.choices)}
                  name={keyPath}
                />
              </LevelLabel>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

function mapSelectList(array: string[]) {
  return array.map((val) => ({ value: val, label: normalCase(val) }));
}

function FiltersPanelGroupHeader({ index }) {
  const { setValue } = useFormContext();
  const filters = useWatch({ name: 'filters' });

  function handleSelectFilter(value, index) {
    const clonedFilters = filters.slice();
    clonedFilters.splice(index, 1, value);
    setValue('filters', clonedFilters);
  }

  function handleAdd(index) {
    if (filters) {
      setValue('filters', [
        ...filters.slice(0, index),
        DEFAULT_MATRIX_FILTERS[0],
        ...filters.slice(index),
      ]);
    }
  }
  function handleDelete(index) {
    setValue(
      'filters',
      filters.filter((_, i) => i !== index),
    );
  }
  return (
    <div
      className="section-header"
      style={{ display: 'flex', padding: '5px 0px' }}
    >
      <p
        style={{
          flex: 1,
          margin: 0,
          paddingRight: '5px',
          ...GroupPanelStyle.header,
        }}
      >
        {index + 1}-
      </p>
      <Select2Controller
        name={`filters[${index}].name`}
        items={matrixFilters}
        onItemSelect={(value) => handleSelectFilter(value, index)}
        fill
        itemTextKey="label"
        itemValueKey="name"
        selectedButtonProps={{ small: true }}
        popoverProps={{ matchTargetWidth: true }}
        filterable
      />

      <div
        style={{
          display: 'flex',
          minWidth: '60px',
          width: '60px',
          justifyContent: 'space-evenly',
        }}
      >
        <Button
          small
          intent="success"
          outlined
          onClick={() => handleAdd(index + 1)}
        >
          <FaPlus className={Classes.ICON} />
        </Button>
        <Button
          small
          outlined
          intent="danger"
          onClick={() => handleDelete(index)}
        >
          <FaRegTrashAlt className={Classes.ICON} />
        </Button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FieldInfo(props: { children: ReactNode; description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {props.children}
      <span style={{ fontSize: '11px', color: 'gray' }}>
        {props.description}
      </span>
    </div>
  );
}

function LevelLabel({ field, children }) {
  const { name, level } = field;

  return (
    <Label
      title={name}
      style={{
        label: { width: '150px' },
        container: {
          paddingLeft: `${10 * level}px`,
          paddingTop: '5px',
        },
      }}
    >
      {children}
    </Label>
  );
}
