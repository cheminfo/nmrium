export function getToFix(nucleusArray: string | Array<string>) {
  if (!Array.isArray(nucleusArray)) nucleusArray = [nucleusArray];
  let toFix: Array<number> = [];
  for (let nucleus of nucleusArray) {
    toFix.push(chooseDecimal(nucleus));
  }
  return toFix;
}

function chooseDecimal(nucleus: string) {
  switch (nucleus.toUpperCase()) {
    case '1H':
      return 2;
    case '13C':
      return 1;
    default:
      return 1;
  }
}
