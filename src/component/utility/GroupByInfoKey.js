const GroupByInfoKey = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj.info[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

export default GroupByInfoKey;
