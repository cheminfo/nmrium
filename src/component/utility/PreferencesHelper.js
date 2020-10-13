import { getLocalStorage, getValue } from './LocalStorage';

function GetPreference(preferences, key) {
  const localData = getLocalStorage('nmr-general-settings');
  const val = getValue(preferences, `formatting.panels.[${key}]`)
    ? getValue(preferences, `formatting.panels.[${key}]`)
    : getValue(localData, `formatting.panels.[${key}]`);
  return val;
}

export { GetPreference };
