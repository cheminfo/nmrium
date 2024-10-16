import { units as baseUnits, Unit } from 'nmr-load-save';

import { roundNumber } from '../../utility/roundNumber.js';

export const units = baseUnits.map((unit) => ({
  ...unit,
  name: unit.name[0].toUpperCase() + unit.name.slice(1),
}));

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

interface ConvertOptions {
  precision?: number; // Number of decimal places for rounding
}

export function convertToPixels(
  value: number,
  unit: Unit,
  dpi: number,
  options: ConvertOptions = {},
): number {
  const { precision } = options;
  if (unit === 'px') {
    return value;
  }

  const factor = conversionFactors[unit] || 1;
  const convertedValue = value * factor * dpi;

  if (typeof precision === 'number') {
    return roundNumber(convertedValue, precision);
  }

  return convertedValue;
}

export function convert(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  dpi,
  options: ConvertOptions = {},
): number {
  const { precision } = options;

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

  if (typeof precision === 'number') {
    return roundNumber(convertedValue, precision);
  }
  return convertedValue;
}
