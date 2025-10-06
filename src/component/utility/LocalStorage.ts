import dlv from 'dlv';
import lodashSet from 'lodash/set.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useStateWithLocalStorage(localStorageKey: any, key?: string) {
  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) || '{}',
  );
  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [localStorageKey, value]);

  const setData = useCallback(
    (data: any, key = null) => {
      let castData = JSON.parse(value);
      if (key) {
        lodashSet(castData, key, data);
      } else {
        castData = { ...castData, ...data };
      }
      setValue(JSON.stringify(castData));
    },
    [value],
  );

  return useMemo(() => {
    return [key ? dlv(JSON.parse(value), key, {}) : JSON.parse(value), setData];
  }, [key, setData, value]);
}

export function getLocalStorage(localStorageKey: any, isJson = true) {
  const settings = localStorage.getItem(localStorageKey);
  return settings && isJson ? JSON.parse(settings) : settings;
}

export function storeData(localStorageKey: any, value: any) {
  localStorage.setItem(localStorageKey, value);
}

export function getValue(object: any, keyPath: any, defaultValue: any = null) {
  return dlv(object, keyPath, defaultValue);
}
