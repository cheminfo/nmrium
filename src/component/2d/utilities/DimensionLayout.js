const LAYOUT = {
  TOP_1D: 'TOP_1D',
  LEFT_1D: 'LEFT_1D',
  CENTER_2D: 'CENTER_2D',
};

function get2DDimensionLayout({ width, height, margin }) {
  return {
    CENTER_2D: {
      startX: margin.left,
      startY: margin.top,
      endX: width - margin.right,
      endY: height - margin.bottom,
    },
    TOP_1D: {
      startX: margin.left,
      startY: 0,
      endX: width - margin.right,
      endY: margin.top,
    },
    LEFT_1D: {
      startX: 0,
      startY: margin.top,
      endX: margin.left,
      endY: height - margin.bottom,
    },
  };
}

function getLayoutID(dimension, brushData) {
  for (const key of Object.keys(dimension)) {
    if (
      brushData.startX >= dimension[key].startX &&
      brushData.startX <= dimension[key].endX &&
      brushData.startY >= dimension[key].startY &&
      brushData.startY <= dimension[key].endY
    ) {
      return key;
    }
  }
  return null;
}

export { LAYOUT, get2DDimensionLayout, getLayoutID };
