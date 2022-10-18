function getNucleusSum(input: string) {
  const nucleus = input.split(',');
  let output = 0;
  for (const i of nucleus) {
    const additions = nucleus.length === 2 ? 100 : 0;
    output += Number(i.replace(/\D/g, '')) + additions;
  }
  return output;
}

export default function GroupByInfoKey(key: string) {
  return (array, orderByNucleus = false) => {
    const unorderedGroup = {};
    for (const obj of array) {
      const value = obj.info[key];
      unorderedGroup[value] = (unorderedGroup[value] || []).concat(obj);
    }

    if (!orderByNucleus) {
      return unorderedGroup;
    } else {
      return Object.fromEntries(
        Object.keys(unorderedGroup)
          .sort((a, b) => getNucleusSum(a) - getNucleusSum(b))
          .map((key) => [key, unorderedGroup[key]]),
      );
    }
  };
}
