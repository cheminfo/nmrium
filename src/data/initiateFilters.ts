export function initiateFilters(inputFilters: any): any {
  if (!inputFilters || !Array.isArray(inputFilters)) return [];

  return inputFilters.map((filter) => ({
    ...filter,
    id: filter?.id || crypto.randomUUID(),
  }));
}
