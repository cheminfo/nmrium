type Path = [string, string | null];

export function removeByPaths(
  obj: any,
  pathsWithKeys: Path[],
  matchValue: string | number,
) {
  for (const [path, key] of pathsWithKeys) {
    remove(obj, path, key, matchValue);
  }
}

function remove(obj: any, path: string, key: string | null, value) {
  const pathParts = path.split('.');

  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    current = current[pathParts[i]];
    if (current === undefined || current === null) {
      // eslint-disable-next-line no-console
      console.error('Path not found:', path);
      return;
    }
  }

  const finalKey = pathParts.at(-1);

  if (!finalKey) return;

  const target = current[finalKey];

  if (Array.isArray(target)) {
    if (target.length > 0 && typeof target[0] === 'object' && key) {
      current[finalKey] = target.filter((item) => item[key] !== value);
    }
  } else if (typeof target === 'object' && target !== null) {
    // eslint-disable-next-line unicorn/no-lonely-if
    if (Object.hasOwn(target, value)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete target[value];
    }
  }
}
