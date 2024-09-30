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

export function round(value: number, power = 100): number {
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
  // switch (unit) {
  //   case 'in':
  //     return value * dpi;
  //   case 'ft':
  //     return value * 12 * dpi; // 1 feet = 12 inch
  //   case 'yd':
  //     return value * 36 * dpi; // 1 yard = 3 feet = 36 inches
  //   case 'cm':
  //     return (value * dpi) / 2.54; // 1 inch = 2.54 cm
  //   case 'mm':
  //     return (value * dpi) / 25.4; // 1 inch = 25.4 mm
  //   case 'm':
  //     return (value * dpi) / 0.0254;   // 1 meter = 12 inch
  //   case 'pt':
  //     return (value * dpi) / 72; // 1 point = 1/72 inch
  //   case 'pc':
  //     return (value * dpi) / 6; // 1 Picas = 1/6 inch
  //   default:
  //     return value; // Default to pixels if no unit is specified
  // }
}
