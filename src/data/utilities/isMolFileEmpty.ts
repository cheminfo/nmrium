export function isMolFileEmpty(molFile: string) {
  if (!molFile) return true;

  const bounds =
    /(?<s>M {2}V30 BEGIN BOND)(?<bounds>.*?)(?<e>M {2}V30 END BOND)/gs.exec(
      molFile,
    )?.groups?.bounds;
  const atoms =
    /(?<s>M {2}V30 BEGIN ATOM)(?<atoms>.*?)(?<e>M {2}V30 END ATOM)/gs.exec(
      molFile,
    )?.groups?.atoms;

  return !(atoms?.trim() || bounds?.trim());
}
