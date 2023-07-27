import lodashSet from 'lodash/set';
import type { FilterXYType } from 'ml-signal-processing';
import filterXY from 'ml-signal-processing/FilterXYSchema.json';

interface BaseField {
  key: string;
  level: number;
  name: string;
  description: string;
}

interface Field<T> extends BaseField {
  default: T;
}

interface LabelField extends BaseField {
  type: 'label';
}

interface SelectField extends Field<any> {
  type: 'select';
  choices: any[];
}
interface StringField extends Field<string> {
  type: 'string';
}
interface NumberField extends Field<number> {
  type: 'number';
}
interface BooleanField extends Field<boolean> {
  type: 'boolean';
}

type CommonField =
  | SelectField
  | StringField
  | NumberField
  | BooleanField
  | LabelField;

interface ListField extends Field<string[]> {
  type: 'list';
  properties: Record<string, CommonField>;
}

type Properties =
  | ListField
  | SelectField
  | StringField
  | NumberField
  | BooleanField
  | LabelField;

export function normalCase(str: string) {
  const result = str.replaceAll(/(?<upper>[A-Z])/g, ' $<upper>').trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function isLeave(fieldOptions) {
  if (['number', 'boolean', 'string'].includes(fieldOptions.type)) {
    return true;
  }
  return false;
}

function flattenFields(
  filterName: string,
  data: any,
  properties: Record<string, Properties>,
  keysPath: string[],
  parentObject: ListField | LabelField | null,
  level: number,
) {
  for (const fieldKey in data) {
    let _keysPath: string[] = [];
    const _keysPathObject = parentObject || null;
    let _level = level || 0;

    if (keysPath) {
      _keysPath = _keysPath.concat(keysPath);
    }

    _keysPath.push(fieldKey);

    if (data[fieldKey]?.properties) {
      properties[_keysPath.join('.')] = {
        type: 'label',
        description: data[fieldKey].description,
        level: _level,
        name: normalCase(fieldKey),
        key: fieldKey,
      };
      flattenFields(
        filterName,
        data[fieldKey]?.properties,
        properties,
        _keysPath,
        null,
        ++_level,
      );
    } else if (data[fieldKey]?.items) {
      flattenFields(
        filterName,
        data[fieldKey]?.items?.properties,
        properties,
        _keysPath,
        {
          type: 'list',
          properties: {},
          default: [],
          description: data[fieldKey]?.description,
          name: normalCase(fieldKey),
          key: fieldKey,
          level: 0,
        },
        ++_level,
      );
    }

    if (isLeave(data[fieldKey])) {
      const fieldData = {
        ...data[fieldKey],
        level: _level,
        name: normalCase(fieldKey),
        key: fieldKey,
      };

      if (_keysPathObject?.type === 'list') {
        const previousKey = _keysPath.slice(0, -1).join('.');
        properties[previousKey] = _keysPathObject;
        (properties[previousKey] as ListField).properties[_keysPath.join('.')] =
          fieldData;
      } else if (data[fieldKey].enum) {
        const { enum: choices, ...restProps } = fieldData;
        properties[_keysPath.join('.')] = {
          choices,
          ...restProps,
          type: 'select',
        };
      } else {
        properties[_keysPath.join('.')] = fieldData;
      }
    }
  }
  return properties;
}

export type MatrixProperties = Record<string /*filed name*/, Properties>;

export interface MatrixFilter {
  name: FilterXYType['name'] /*filter name*/;
  properties: MatrixProperties;
  options: any;
}

const IGNORED_FILERS = new Set<FilterXYType['name']>([
  'equallySpaced',
  'filterX',
  'fromTo',
]);

export function getMatrixFilters() {
  const result: MatrixFilter[] = [];

  for (const filter of filterXY.anyOf) {
    const filterData = filter.properties;
    const filterProperties = filterData?.options;
    const name = filterData.name.enum[0] as FilterXYType['name'];

    if (!IGNORED_FILERS.has(name)) {
      const properties = flattenFields(
        name,
        filterProperties?.properties,
        {},
        [],
        null,
        0,
      );
      result.push({
        name,
        properties,
        options: generateFilterOptions(properties),
      });
    }
  }
  return result;
}

function generateFilterOptions(properties: MatrixProperties) {
  const options: any = {};

  for (const key in properties) {
    const field = properties[key];
    switch (field.type) {
      case 'list':
        lodashSet(options, key, []);
        break;
      case 'select':
        lodashSet(
          options,
          key,
          field.default
            ? field.default.replaceAll(/'|"/g, '')
            : field.choices[0],
        );
        break;
      case 'string':
        lodashSet(options, key, undefined);
        break;
      case 'number': {
        lodashSet(
          options,
          key,
          typeof field.default === 'number' ? field.default : undefined,
        );
        break;
      }
      case 'boolean': {
        lodashSet(
          options,
          key,
          typeof field.default === 'boolean' ? field.default : false,
        );
        break;
      }

      default:
        break;
    }
  }
  return options;
}
