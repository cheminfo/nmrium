function getClosestNumber(array: number[] = [], goal = 0) {
  // eslint-disable-next-line unicorn/no-array-reduce
  const closest = array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  }, Number.POSITIVE_INFINITY);
  return closest;
}

export default getClosestNumber;
