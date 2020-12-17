function getNucleusSum(input) {
  return input
    .split(',')
    .reduce((acc, i) => (acc += Number(i.replace(/\D/g, ''))), 0);
}
const GroupByInfoKey = (key) => (array) => {
  const unorderedGroup = array.reduce((objectsByKeyValue, obj) => {
    const value = obj.info[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

  return Object.keys(unorderedGroup)
    .sort((a, b) => getNucleusSum(a) - getNucleusSum(b))
    .reduce((acc, key) => {
      acc[key] = unorderedGroup[key];
      return acc;
    }, {});
};

export default GroupByInfoKey;
