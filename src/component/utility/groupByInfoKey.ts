function getNucleusSum(input: string) {
  const nucleus = input.split(',');
  let output = 0;
  for (const i of nucleus) {
    const additions = nucleus.length === 2 ? 100 : 0;
    output += Number(i.replaceAll(/\D/g, '')) + additions;
  }
  return output;
}

export default function groupByInfoKey(key: string) {
  return (array, orderByNucleus = false) => {
    const unorderedGroup = {};
    for (const obj of array) {
      const value = obj.info[key];
      unorderedGroup[value] = (unorderedGroup[value] || []).concat(obj);
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
