import { SignalConcatenationString } from '../constants/ConcatenationStrings';

const buildID = (prefix, suffix) => {
  return `${prefix}${SignalConcatenationString}${suffix}`;
};

export { buildID };
