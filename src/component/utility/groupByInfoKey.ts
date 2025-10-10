function getNucleusSum(input: string) {
  const nucleus = input.split(',');
  let output = 0;
  for (const i of nucleus) {
    const additions = nucleus.length === 2 ? 100 : 0;
    output += Number(i.replaceAll(/\D/g, '')) + additions;
  }
  return output;
}

// TODO: this function is only used with nucleus as key and does not need to be generic
export default function groupByInfoKey<
  U extends string,
  T extends { info: Record<U, string | string[]> },
>(key: U) {
  return (array: T[], orderByNucleus = false) => {
    const unorderedGroup: Record<string, T[]> = {};
    for (const obj of array) {
      const value = obj.info[key];
      const groupKey = typeof value === 'string' ? value : value.join(',');
      unorderedGroup[groupKey] = (unorderedGroup[groupKey] || []).concat(obj);
    }

    if (!orderByNucleus) {
      return unorderedGroup;
    } else {
      const newGroup = Object.entries(unorderedGroup);
      newGroup.sort(
        ([keyA], [keyB]) => getNucleusSum(keyA) - getNucleusSum(keyB),
      );
      return Object.fromEntries(newGroup);
    }
  };
}
