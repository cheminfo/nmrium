function getClosestNumber(array: number[], goal = 0) {
  let closest = Infinity;
  array.forEach((curr) => {
    closest = Math.abs(curr - goal) < Math.abs(closest - goal) ? curr : closest;
  });
  return closest;
}

export default getClosestNumber;
