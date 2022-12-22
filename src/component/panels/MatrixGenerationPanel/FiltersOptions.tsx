/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { ReactNode } from 'react';

import { MatrixFilter, normalCase } from '../../../data/matrixGeneration';
import { GroupPane } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label from '../../elements/Label';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';

import { GroupPanelStyle } from './MatrixGenerationPanel';

const inputStyle: InputStyle = {
  input: { padding: '0.2em 0.1em', width: '100%' },
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
        style={GroupPanelStyle}
      >
        <Fields filter={filter} basePath={`filters.${index}`} />
      </GroupPane>
    );
  });
}

function Fields(props: { filter: MatrixFilter; basePath: string }) {
  const fields = Object.entries(props.filter.properties);
  let level = 0;

  if (!fields || fields.length === 0) {
    return <span style={{ color: 'lightgray' }}>No Options</span>;
  }

  return (
    <div>
      {fields.map(([key, field]) => {
        const keyPath = `${props.basePath}.options.${key}`;
        switch (field.type) {
          case 'label': {
            const fieldsGroupName = key.split('.')?.[level] || '';

            return (
              <Label
                key={key}
                description={field.description}
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
                description={field.description}
              >
                <FormikInput
                  name={keyPath}
                  type={field.type === 'string' ? 'text' : 'number'}
                  style={inputStyle}
                  placeholder={`${field.default}`}
                />
              </Label>
            );
            level = field.level;
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
                description={field.description}
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
                description={field.description}
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
