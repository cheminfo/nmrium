import { generateColor } from '../../utilities/generateColor';

export function get1DColor(options, usedColors, regenerate = false) {
  let color = 'black';
  if (options?.display?.color === undefined || regenerate) {
    color = generateColor(false, usedColors['1d'] || []);
  } else {
    color = options.display.color;
  }

  if (usedColors['1d']) {
    usedColors['1d'].push(color);
  }

  return { color };
}
