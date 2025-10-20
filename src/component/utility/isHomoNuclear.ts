export function isHomoNuclear(nuclei: string | string[], splitSeparator = ',') {
  let parts: string[] = [];

  if (typeof nuclei === 'string') {
    parts = nuclei.split(splitSeparator).map((s) => s.trim());
  } else {
    parts = nuclei;
  }

  return parts.length === 1 || parts.every((p) => p === parts[0]);
}
