export function replaceNucleiObjectKeys<
  T extends { nuclei: Record<string, any> },
>(data: T, searchValue: string, replaceValue: string): T {
  const nuclei: Record<string, any> = {};

  for (const key in data.nuclei) {
    nuclei[key.replace(searchValue, replaceValue)] = data.nuclei[key];
  }

  return { ...data, nuclei } as T;
}
