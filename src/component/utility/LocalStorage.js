import lodash from 'lodash';
import { useEffect, useState } from 'react';

const useStateWithLocalStorage = (localStorageKey) => {
  const [value, setValue] = useState(localStorage.getItem(localStorageKey));
  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [localStorageKey, value]);
  return [!value ? {} : JSON.parse(value), setValue];
};

const getLocalStorage = (localStorageKey) => {
  const settings = localStorage.getItem(localStorageKey);
  return settings ? JSON.parse(settings) : settings;
};

const getValue = (object, keyPath, defaultValue = null) => {
  return lodash.get(object, keyPath, defaultValue);
};

export { useStateWithLocalStorage, getLocalStorage, getValue };
