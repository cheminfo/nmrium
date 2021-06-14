import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import { useCallback, useEffect, useState } from 'react';

export function useStateWithLocalStorage(localStorageKey, key?: string) {
  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) || '{}',
  );
  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [localStorageKey, value]);

  const setData = useCallback(
    (data, key = null) => {
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
  return [
    key ? lodashGet(JSON.parse(value), key, {}) : JSON.parse(value),
    setData,
  ];
}

export function getLocalStorage(localStorageKey, isJson = true) {
  const settings = localStorage.getItem(localStorageKey);
  return settings && isJson ? JSON.parse(settings) : settings;
}

export function storeData(localStorageKey, value) {
  localStorage.setItem(localStorageKey, value);
}

export function removeData(localStorageKey) {
  localStorage.removeItem(localStorageKey);
}

export function getValue(object, keyPath, defaultValue = null) {
  return lodashGet(object, keyPath, defaultValue);
}
