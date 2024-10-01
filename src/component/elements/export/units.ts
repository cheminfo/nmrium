export const units = [
  { name: 'Pixels', unit: 'px' },
  { name: 'Inches', unit: 'in' },
  { name: 'Feet', unit: 'ft' },
  { name: 'Yards', unit: 'yd' },
  { name: 'Centimetres', unit: 'cm' },
  { name: 'Millimetres', unit: 'mm' },
  { name: 'Meters', unit: 'm' },
  { name: 'Points', unit: 'pt' },
  { name: 'Picas', unit: 'pc' },
];

type UnitElement = (typeof units)[number];
export type Unit = UnitElement['unit'];
export type UnitName = UnitElement['name'];

export interface UnitItem {
  name: string;
  unit: Unit;
}

export function round(value: number, power = 100000): number {
  return Math.round(value * power) / power;
}

const conversionFactors: Record<Unit, number> = {
  in: 1, // inches
  ft: 12, // 1 foot = 12 inches
  yd: 36, // 1 yard = 36 inches
  cm: 1 / 2.54, // 1 inch = 2.54 cm
  mm: 1 / 25.4, // 1 inch = 25.4 mm
  m: 1 / 0.0254, // 1 inch = 0.0254 m
  pt: 1 / 72, // 1 point = 1/72 inch
  pc: 1 / 6, // 1 Pica = 1/6 inch
  px: 1, // pixels (default, no conversion)
};

export function convertToPixels(value: number, unit: Unit, dpi = 1): number {
  if (unit === 'px') {
    return value;
  }

  const factor = conversionFactors[unit] || 1;

  return round(value * factor * dpi);
}

export function convert(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  dpi,
): number {
  let fromDPI = dpi;
  let toDPI = dpi;
  if (fromUnit !== 'px') {
    fromDPI = 1;
  }
  if (toUnit !== 'px') {
    toDPI = 1;
  }

  const valueInInch = (conversionFactors[fromUnit] / fromDPI) * value;

  const convertedValue = (valueInInch / conversionFactors[toUnit]) * toDPI;

  return round(convertedValue);
}
