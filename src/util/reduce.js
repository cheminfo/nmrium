import binarySearch from 'binary-search';

/**
 *
 * @param {array} x
 * @param {array} y
 * @param {object} [options={}]
 * @param {number} [from=x[0]]
 * @param {number} [to=x[x.length-1]]
 * @param {number} [nbPoints=4001] Number of points
 */

export default function reduce(x, y, options = {}) {
  let { from = x[0], to = x[x.length - 1], nbPoints = 4001 } = options;

  let fromIndex = closestIndex(x, from);
  let toIndex = closestIndex(x, to);
  if (fromIndex > 0 && x[fromIndex] > from) fromIndex--;
  if (toIndex < x.length - 1 && x[toIndex] < to) toIndex++;

  if (toIndex - fromIndex < nbPoints) {
    return {
      x: x.slice(fromIndex, toIndex + 1),
      y: y.slice(fromIndex, toIndex + 1),
    };
  }

  let newX = [x[fromIndex]];
  let newY = [y[fromIndex]];
  let minY = Number.MAX_VALUE;
  let maxY = Number.MIN_VALUE;
  if (nbPoints % 2 === 0) {
    nbPoints = nbPoints / 2 + 1;
  } else {
    nbPoints = (nbPoints - 1) / 2 + 1;
  }
  let slot = (x[toIndex] - x[fromIndex]) / (nbPoints - 1);
  let currentX = x[fromIndex] + slot;
  let first = true;
  for (let i = fromIndex + 1; i <= toIndex; i++) {
    if (first) {
      minY = y[i];
      maxY = y[i];
      first = false;
    } else {
      if (y[i] < minY) minY = y[i];
      if (y[i] > maxY) maxY = y[i];
    }

    if (x[i] >= currentX || i === toIndex) {
      newX.push(currentX - slot / 2);
      newY.push(minY);
      newX.push(currentX);
      newY.push(maxY);
      currentX += slot;
      first = true;
    }
  }

  // we will need to make some kind of min / max because there are too many points
  // we will always keep the first point and the last point

  return { x: newX, y: newY };
}

function closestIndex(x, target) {
  let index = binarySearch(x, target, (element, needle) => element - needle);
  if (index >= 0) {
    return index;
  } else {
    index = ~index;
    if (
      (index !== 0 && Math.abs(x[index] - target) > 0.5) ||
      index === x.length
    ) {
      return index - 1;
    } else {
      return index;
    }
  }
}
