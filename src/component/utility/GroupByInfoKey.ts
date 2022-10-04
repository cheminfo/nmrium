function getNucleusSum(input: string) {
  const nucleus = input.split(',');
  let output = 0;
  nucleus.forEach((i) => {
    const additions = nucleus.length === 2 ? 100 : 0;
    output += Number(i.replace(/\D/g, '')) + additions;
  });
  return output;
}

export default function GroupByInfoKey(key: string) {
  return (array, orderByNucleus = false) => {
    const unorderedGroup = {};
    array.forEach((obj) => {
      const value = obj.info[key];
      unorderedGroup[value] = (unorderedGroup[value] || []).concat(obj);
    });

    if (!orderByNucleus) {
      return unorderedGroup;
    } else {
      const orderedGroup = {};
      Object.keys(unorderedGroup)
        .sort((a, b) => getNucleusSum(a) - getNucleusSum(b))
        .forEach((key) => {
          orderedGroup[key] = unorderedGroup[key];
        });
      return orderedGroup;
    }
  };
}
