import { isAnyArray } from 'is-any-array';

/**
 *
 * @param data - any data object that may contain object, arrays, etc
 * @param mapping - a mapping from the original property path to the new property name
 * @param callback - a function that takes the original value and returns the new value
 */
export function calculateDerivedProperties(
  data: any,
  mapping: Record<string, string>,
  callback: (value: number) => number,
) {
  deriveProps(data, (parent: any, propName: string, info: any) => {
    const path = info.noArrayPath.join('.');
    const newPropName = mapping[path];
    if (newPropName) {
      if (isAnyArray(info.value)) {
        parent[newPropName] = info.value.map((value) => callback(value));
      } else {
        parent[newPropName] = callback(info.value);
      }
    }
  });
}

function deriveProps(data, callback, options = {}): void {
  const info = {
    path: [],
    noArrayPath: [],
  };
  derivePropsSS(data, callback, info, options);
}

function derivePropsSS(data, callback, info, options = {}): void {
  if (typeof data !== 'object' || isArrayOfPrimitives(data)) {
    return;
  }
  for (const propName in data) {
    if (data[propName] !== undefined) {
      const newInfo: any = {
        path: [...info.path, propName],
        noArrayPath: info.noArrayPath,
      };
      if (!isAnyArray(data)) {
        newInfo.noArrayPath = [...info.noArrayPath, propName];
      }
      if (
        typeof data[propName] === 'object' &&
        !isArrayOfPrimitives(data[propName])
      ) {
        derivePropsSS(data[propName], callback, newInfo, options);
      } else {
        callback(data, propName, { value: data[propName], ...newInfo });
      }
    }
  }
}

function isArrayOfPrimitives(value) {
  return isAnyArray(value) && value.every((v) => typeof v !== 'object');
}
