import lodash from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const useStateWithLocalStorage = (localStorageKey, key = null) => {
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
        lodash.set(castData, key, data);
      } else {
        castData = { ...castData, ...data };
      }
      setValue(JSON.stringify(castData));
    },
    [value],
  );
  return [
    key ? lodash.get(JSON.parse(value), key, {}) : JSON.parse(value),
    setData,
  ];
};

const getLocalStorage = (localStorageKey, isJson = true) => {
  const settings = localStorage.getItem(localStorageKey);
  return settings && isJson ? JSON.parse(settings) : settings;
};

const storeData = (localStorageKey, value) => {
  localStorage.setItem(localStorageKey, value);
};
const removeData = (localStorageKey) => {
  localStorage.removeItem(localStorageKey);
};

const getValue = (object, keyPath, defaultValue = null) => {
  return lodash.get(object, keyPath, defaultValue);
};

export {
  useStateWithLocalStorage,
  getLocalStorage,
  getValue,
  storeData,
  removeData,
};
