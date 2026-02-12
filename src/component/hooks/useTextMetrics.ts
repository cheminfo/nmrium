import { useEffect, useMemo } from 'react';

interface UseTextMetricsOptions {
  labelSize?: number;
  labelStyle?: string;
  labelWeight?: string;

  /**
   * Dev purpose only.
   * Set a width to see the canvas used to measure text.
   */
  debugCanvasWidth?: number;
}

export function useTextMetrics(options: UseTextMetricsOptions = {}) {
  const {
    labelSize = 12,
    labelStyle = 'normal',
    labelWeight = 'normal',
    debugCanvasWidth,
  } = options;
  const canvas = useCanvas(debugCanvasWidth);

  const ctx = canvas.getContext('2d');
  if (ctx) ctx.font = `${labelStyle} ${labelWeight} ${labelSize}px Arial`;

  function getTextWidth(text: string): number {
    return measureTextWidth(ctx, text);
  }

  return {
    getTextWidth,
    /**
     * @deprecated Use only for debug mode
     */
    ctx,
  };
}

function useCanvas(width: number | undefined) {
  const canvas = useMemo(() => {
    const canvas = document.createElement('canvas');
    if (width) {
      canvas.width = width;
      canvas.height = 450;
    }
    canvas.style.position = 'absolute';
    canvas.style.bottom = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '100';
    canvas.style.opacity = '50%';
    canvas.style.background = 'white';
    return canvas;
  }, [width]);

  useEffect(() => {
    if (!width) return;

    document.body.append(canvas);

    return () => {
      canvas.remove();
    };
  }, [canvas, width]);

  return canvas;
}

function measureTextWidth(
  context: CanvasRenderingContext2D | null,
  text: string,
) {
  if (!context) return 0;
  return Math.round(context.measureText(text).width);
}
