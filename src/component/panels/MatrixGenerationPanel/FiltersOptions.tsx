/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { ReactNode } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import { MatrixFilter, normalCase } from '../../../data/matrixGeneration';
import Button from '../../elements/Button';
import { GroupPane } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label from '../../elements/Label';
import Select from '../../elements/Select';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';

import {
  DEFAULT_MATRIX_FILTERS,
  GroupPanelStyle,
} from './MatrixGenerationPanel';

const inputStyle: InputStyle = {
  input: { padding: '0.4em', width: '100%' },
};

export function FiltersOptions() {
  const { values } = useFormikContext<any>();

  if (!values?.filters || !Array.isArray(values.filters)) {
    return null;
  }

  return values.filters.map((filter, index) => {
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
          case 'string':
          case 'number': {
            const Field = (
              <Label
                key={key}
                title={field.name}
                style={{
                  label: { width: '150px' },
                  container: {
                    paddingLeft: `${10 * field.level}px`,
                    paddingTop: '5px',
                  },
                }}
              >
                <FormikInput
                  name={keyPath}
                  type={field.type === 'string' ? 'text' : 'number'}
                  style={inputStyle}
                  placeholder={`${field.default}`}
                />
              </Label>
            );
            return Field;
          }
          case 'boolean': {
            return (
              <Label
                key={key}
                title={field.name}
                style={{
                  label: { width: '150px' },
                  container: {
                    paddingTop: '5px',
                    paddingLeft: `${10 * field.level}px`,
                  },
                }}
              >
                <FormikCheckBox name={keyPath} />
              </Label>
            );
          }
          case 'select': {
            return (
              <Label
                key={key}
                title={field.name}
                style={{
                  label: { width: '150px' },
                  container: {
                    paddingTop: '5px',
                    paddingLeft: `${10 * field.level}px`,
                  },
                }}
              >
                <FormikSelect
                  items={mapSelectList(field.choices)}
                  name={keyPath}
                />
              </Label>
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

function FiltersPanelGroupHeader({ index, name }) {
  const { values, setFieldValue } = useFormikContext<any>();

  function handelSelectFilter(value, index) {
    const filters = values.filters.slice(0);
    filters.splice(index, 1, value);
    void setFieldValue('filters', filters);
  }

  function handleAdd(index) {
    if (values.filters) {
      void setFieldValue('filters', [
        ...values.filters.slice(0, index),
        DEFAULT_MATRIX_FILTERS[0],
        ...values.filters.slice(index),
      ]);
    }
  }
  function handleDelete(index) {
    void setFieldValue(
      'filters',
      values.filters.filter((_, i) => i !== index),
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
      <Select
        value={name}
        items={DEFAULT_MATRIX_FILTERS}
        onChange={(value) => handelSelectFilter(value, index)}
        style={{ width: '100%' }}
        returnValue={false}
        itemTextField="name"
        itemValueField="name"
        textRender={(text) => normalCase(text)}
      />

      <div style={{ display: 'flex' }}>
        <Button.Danger
          fill="outline"
          onClick={() => handleDelete(index)}
          style={{ marginLeft: '5px' }}
        >
          <FaTimes />
        </Button.Danger>

        <Button.Done
          fill="outline"
          onClick={() => handleAdd(index + 1)}
          style={{ marginLeft: '5px' }}
        >
          <FaPlus />
        </Button.Done>
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
