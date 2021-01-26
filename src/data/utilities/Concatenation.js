const ConcatenationString = '___';

const buildID = (prefix, suffix) => {
  return `${prefix}${ConcatenationString}${suffix}`;
};

export { buildID, ConcatenationString };
