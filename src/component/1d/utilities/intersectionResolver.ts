interface ResolveGroupIntersectionProps {
  maxIteration?: number;
  groupMargin?: number;
}

interface GroupDataProps<T> {
  threshold?: number;
  key: keyof T;
}

interface ResolveIntersectionProps<T>
  extends GroupDataProps<T>,
    ResolveGroupIntersectionProps {
  width?: number;
  margin?: number;
}

interface GroupMeta {
  groupWidth: number;
  groupMidX: number;
  groupStartX: number;
  groupEndX: number;
  id: string;
}

interface ResolveData<T> {
  group: T[];
  meta: GroupMeta;
}

function groupData<T>(data: T[], options: Required<GroupDataProps<T>>) {
  const { threshold, key } = options;

  const groups: T[][] = [];
  let lastRefValue = data[0][key] as number;
  let groupIndex = 0;
  for (const datum of data) {
    if ((datum[key] as number) - lastRefValue <= threshold) {
      if (!groups[groupIndex]) {
        groups.push([datum]);
      } else {
        groups[groupIndex].push(datum);
      }
    } else {
      lastRefValue = datum[key] as number;
      groupIndex++;
      groups.push([datum]);
    }
  }

  return groups;
}

function resolveGroupsIntersection(
  groups: any,
  options: ResolveGroupIntersectionProps,
) {
  const { maxIteration = 3, groupMargin = 0 } = options;
  let iteration = 1;
  let hasIntersection = true;
  const newGroups = structuredClone(groups);

  while (iteration < maxIteration && hasIntersection) {
    iteration++;
    hasIntersection = false;
    let previousGroup = newGroups[0];

    for (let i = 1; i < newGroups.length; i++) {
      const currentGroupMeta = newGroups[i].meta;

      if (previousGroup.meta.groupEndX > currentGroupMeta.groupStartX) {
        const diff = Math.abs(
          currentGroupMeta.groupStartX - previousGroup.meta.groupEndX,
        );
        hasIntersection = true;

        const shift = diff + groupMargin;
        newGroups[i].meta = {
          ...newGroups[i].meta,
          groupStartX: currentGroupMeta.groupStartX + shift,
          groupEndX: currentGroupMeta.groupEndX + shift,
          groupMidX: currentGroupMeta.groupMidX + shift,
        };
      }
      previousGroup = newGroups[i];
    }
  }
  return newGroups;
}

export function resolve<T>(
  data: T[],
  options: ResolveIntersectionProps<T>,
): Array<ResolveData<T>> {
  const {
    width = 10,
    margin = 5,
    groupMargin = 0,
    key,
    threshold: inputThreshold,
  } = options;

  if (!Array.isArray(data) || data.length === 0) return [];

  const threshold = inputThreshold || width + margin * 2;
  const groupedData = groupData(data, { threshold, key });
  const resolvedGroups: Array<ResolveData<T>> = [];

  for (const group of groupedData) {
    const groupWidth = group.length * width + (group.length - 1) * margin;
    let sum = 0;
    for (const groupDatum of group) {
      sum += groupDatum[key] as number;
    }
    const groupMidX = sum / group.length;
    const groupStartX = groupMidX - groupWidth / 2 + width / 2;
    const groupEndX = groupWidth / 2 + groupMidX;
    resolvedGroups.push({
      group,
      meta: {
        groupMidX,
        groupStartX,
        groupEndX,
        groupWidth,
        id: crypto.randomUUID(),
      },
    });
  }

  return resolveGroupsIntersection(resolvedGroups, { groupMargin });
}
