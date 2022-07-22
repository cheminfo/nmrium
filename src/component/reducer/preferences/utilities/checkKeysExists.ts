import { flatObject } from './flatObject';

export function checkKeysExists(sourceObject, targetObject) {
  const source = flatObject(sourceObject);
  const target = flatObject(targetObject);

  if (Object.keys(target).length === 0) {
    return false;
  }

  for (const [key, value] of Object.entries(source)) {
    if (!target[key] || target[key] !== value) {
      return false;
    }
  }

  return true;
}
