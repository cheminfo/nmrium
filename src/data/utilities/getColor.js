export const COLORS = [
  '#FFB300',
  '#803E75',
  '#FF6800',
  '#A6BDD7',
  '#C10020',
  '#CEA262',
  '#817066',
  '#007D34',
  '#F6768E',
  '#00538A',
  '#FF7A5C',
  '#53377A',
  '#FF8E00',
  '#B32851',
  '#F4C800',
  '#7F180D',
  '#93AA00',
  '#593315',
  '#F13A13',
  '#232C16',
  '',
];

const color2D = {
  cosy: { positiveColor: 'darkblue', negativeColor: 'blue' },
  roesy: { positiveColor: 'pink', negativeColor: 'yellow' },
  noesy: { positiveColor: 'pink', negativeColor: 'yellow' },
  tocsy: { positiveColor: 'green', negativeColor: 'yellow' },
  hsqc: { positiveColor: 'black', negativeColor: 'yellow' },
  hmbc: { positiveColor: 'darkviolet', negativeColor: 'yellow' },
};

const hasPredefine2DColor = (experiment) => {
  return color2D[experiment] ? true : false;
};

const get2DColor = (experiment, colors = []) => {
  if (!color2D[experiment]) {
    const positiveColor = getColor(false, colors);
    const negativeColor = adjustAlpha(positiveColor, 50);
    return { positiveColor, negativeColor };
  }
  return color2D[experiment];
};

const percentToHex = (p) => {
  const percent = Math.max(0, Math.min(100, p));
  const intValue = Math.round((percent / 100) * 255);
  const hexValue = intValue.toString(16);
  return percent === 100 ? '' : hexValue.padStart(2, '0');
};

const adjustAlpha = (color, factor) => {
  return color + percentToHex(factor);
};

const getColor = (isRandom = false, usedColors = [], opacity = 100) => {
  const resetColors = COLORS.filter((c) => !usedColors.includes(c));
  if (resetColors.length > 0 && !isRandom) {
    return resetColors[0] + percentToHex(opacity);
  } else {
    const lum = -0.25;
    let hex = String(
      `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    ).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let rgb = '#';
    let c;
    let i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += `00${c}`.substr(c.length);
    }

    return rgb + percentToHex(opacity);
  }
};
export { percentToHex, adjustAlpha, hasPredefine2DColor, get2DColor };
export default getColor;
