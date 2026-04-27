import type { FilterType } from './filterType.js';

interface StackOverlappingLabelsOptions<T> {
  startPositionKey: keyof FilterType<T, number>;
  labelWidthKey: keyof FilterType<T, number>;
  padding?: number;
}

export type StackOverlappingLabelsMapReturnType = Record<
  string | number,
  number
>;

type StackOverlappingLabelsArrayItemReturnType<T> = T & {
  stackIndex: number;
};
type StackOverlappingLabelsArrayReturnType<T> = Array<
  StackOverlappingLabelsArrayItemReturnType<T>
>;

export function stackOverlappingLabelsArray<T extends Record<string, any>>(
  items: T[],
  options: StackOverlappingLabelsOptions<T>,
): StackOverlappingLabelsArrayReturnType<T> {
  const groups = stackOverlappingLabels(items, options);

  return groups.flatMap((group) => {
    let i = 0;
    return group.map((item) => {
      const stackIndex = i;
      if (item.assignment) {
        i++;
      }
      return {
        ...item,
        stackIndex,
      };
    });
  });
}
/**
 * Assigns a stack index (vertical lane) to each item so that horizontally
 * overlapping labels are pushed to different lanes, while non-overlapping
 * labels reuse the lowest available lane.
 * */
export function stackOverlappingLabelsMap<T extends Record<string, any>>(
  items: T[],
  options: StackOverlappingLabelsOptions<T> & { idKey: keyof T },
): StackOverlappingLabelsMapReturnType {
  const { idKey, startPositionKey, labelWidthKey, padding = 0 } = options;
  const groups = stackOverlappingLabels(items, options);

  const stackMap: StackOverlappingLabelsMapReturnType = {};

  for (const group of groups) {
    const laneEdges: number[] = [];

    for (const item of group) {
      const key = item[idKey];
      if (key === undefined || key === null) {
        throw new Error(
          `Invalid or missing idKey value for item: ${JSON.stringify(item)}`,
        );
      }

      const startPosition = item[startPositionKey];
      const itemEnd = startPosition + item[labelWidthKey] + padding;

      // Find the first lane whose right edge does not overlap this item is start.
      // If no such lane exists, open a new one.
      let assignedLane = laneEdges.findIndex((edge) => edge <= startPosition);
      if (assignedLane === -1) {
        assignedLane = laneEdges.length;
      }

      laneEdges[assignedLane] = itemEnd;
      stackMap[key] = assignedLane;
    }
  }

  return stackMap;
}

function stackOverlappingLabels<T extends Record<string, any>>(
  items: T[],
  options: StackOverlappingLabelsOptions<T>,
) {
  const { startPositionKey, labelWidthKey, padding = 0 } = options;
  const groups: T[][] = [];
  let currentGroup: T[] = [];
  let lastInPixel = 0;

  for (const item of items) {
    const startPosition = item[startPositionKey];
    const labelWidth = item[labelWidthKey];

    if (startPosition < lastInPixel) {
      currentGroup.push(item);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [item];
    }
    lastInPixel = Math.max(lastInPixel, startPosition + labelWidth + padding);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup); // Push the last group after the loop
  }

  return groups;
}
