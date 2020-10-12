import { getLocalStorage, getValue } from './LocalStorage';

function GetPreference(preferences, key) {
  const localData = getLocalStorage('nmr-general-settings');
  const val = getValue(preferences, `panels.[${key}]`)
    ? getValue(preferences, `panels.[${key}]`)
    : getValue(localData, `panels.[${key}]`);
  return val;
}

export { GetPreference };
