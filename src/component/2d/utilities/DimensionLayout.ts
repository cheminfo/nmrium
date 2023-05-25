const LAYOUT = {
  TOP_1D: 'TOP_1D',
  LEFT_1D: 'LEFT_1D',
  CENTER_2D: 'CENTER_2D',
} as const;

type Layout = keyof typeof LAYOUT;

interface MarginProps {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

function get2DDimensionLayout({
  width,
  height,
  margin,
}: {
  width: number;
  height: number;
  margin: MarginProps;
}) {
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

interface StartEndProps {
  startX: number;
  endX?: number;
  startY: number;
  endY?: number;
}

type DimensionType = {
  [key in Layout]: Required<StartEndProps>;
};

function getLayoutID(
  dimension: DimensionType,
  brushData: StartEndProps,
): Layout | null {
  for (const key of Object.keys(dimension)) {
    if (
      brushData.startX >= dimension[key].startX &&
      brushData.startX <= dimension[key].endX &&
      brushData.startY >= dimension[key].startY &&
      brushData.startY <= dimension[key].endY
    ) {
      return key as Layout;
    }
  }
  return null;
}

export { LAYOUT, get2DDimensionLayout, getLayoutID };
export type { Layout };
