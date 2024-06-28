export function colorToHexWithAlpha(color: {
  hex: string;
  rgb: { r: number; g: number; b: number; a: number };
}) {
  const alphaHex = Math.round(color.rgb.a * 255).toString(16);
  return `${color.hex}${alphaHex}`;
}
