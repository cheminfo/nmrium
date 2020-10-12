import lodash from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const useStateWithLocalStorage = (localStorageKey) => {
  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) || '{}',
  );
  useEffect(() => {
    console.log(value);
    localStorage.setItem(localStorageKey, value);
  }, [localStorageKey, value]);

  const setData = useCallback(
    (data, key = null) => {
      let castData = JSON.parse(value);
      console.log(data, castData);
      if (key) {
        lodash.set(castData, key, data);
      } else {
        castData = { ...castData, ...data };
      }
      setValue(JSON.stringify(castData));
    },
    [value],
  );
  return [JSON.parse(value), setData];
};

const getLocalStorage = (localStorageKey) => {
  const settings = localStorage.getItem(localStorageKey);
  return settings ? JSON.parse(settings) : settings;
};

const getValue = (object, keyPath, defaultValue = null) => {
  return lodash.get(object, keyPath, defaultValue);
};

export { useStateWithLocalStorage, getLocalStorage, getValue };
