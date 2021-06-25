function getClosestNumber(array: number[] = [], goal = 0) {
  const closest = array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
  return closest;
}

export default getClosestNumber;
