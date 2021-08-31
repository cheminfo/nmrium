function getNucleusSum(input) {
  const nucleus = input.split(',');
  return nucleus.reduce((acc, i) => {
    const additions = nucleus.length === 2 ? 100 : 0;
    acc += Number(i.replace(/\D/g, '')) + additions;
    return acc;
  }, 0);
}

export default function GroupByInfoKey(key) {
  return (array, orderByNucleus = false) => {
    const unorderedGroup = array.reduce((objectsByKeyValue, obj) => {
      const value = obj.info[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});

    if (!orderByNucleus) {
      return unorderedGroup;
    } else {
      return Object.keys(unorderedGroup)
        .sort((a, b) => getNucleusSum(a) - getNucleusSum(b))
        .reduce((acc, key) => {
          acc[key] = unorderedGroup[key];
          return acc;
        }, {});
    }
  };
}
