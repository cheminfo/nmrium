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
];

 const getColor = (usedColors) => {
  const resetColors = COLORS.filter((c) => !usedColors.includes(c));
  if (resetColors.length > 0) {
    return resetColors[0];
  } else {
    var lum = -0.25;
    var hex = String(
      '#' +
        Math.random()
          .toString(16)
          .slice(2, 8)
          .toUpperCase(),
    ).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var rgb = '#',
      c,
      i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }

    return rgb;
  }
};

export default getColor;