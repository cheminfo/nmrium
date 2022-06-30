export function isMolFileEmpty(molFile: string) {
  if (!molFile) return true;

  const molText =
    /(?<s>M {2}V30 BEGIN BOND)(?<mol>.*?)(?<e>M {2}V30 END BOND)/gs.exec(
      molFile,
    )?.groups?.mol;

  return !molText?.trim();
}
