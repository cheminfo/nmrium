import type { FilterXYType } from 'ml-signal-processing';
import filterXY from 'ml-signal-processing/FilterXYSchema.json';

interface FilterOptionsInfo {
  defaultValue: string | number;
  choices?: string[];
  description: string;
}

type FiltersObjectRecord = Record<string, FilterOptionsInfo>;

export type MatrixFilters = Array<{
  name: FilterXYType['name'];
  options: FiltersObjectRecord;
}>;

export function getDefaultMatrixFilters() {
  // get filters information & default options values
  return filterXY.anyOf
    .filter(({ properties }) => properties.name.enum[0] !== 'equallySpaced')
    .map(({ properties }) => {
      const options: FiltersObjectRecord = {};
      for (const [key, value] of Object.entries(
        properties?.options?.properties || {},
      )) {
        options[key] = {
          defaultValue: value.default,
          choices: value.enum,
          description: value.description,
        };
      }

      return {
        name: properties.name.enum[0] as FilterXYType['name'],
        options,
      };
    });
}
