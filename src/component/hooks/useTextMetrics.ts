import type { CSSProperties } from 'react';
import { useEffect, useMemo } from 'react';

interface UseTextMetricsOptions extends Pick<
  CSSProperties,
  'fontStyle' | 'fontWeight' | 'fontSize'
> {
  /**
   * Dev purpose only.
   * Set a width to see the canvas used to measure text.
   */
  debugCanvasWidth?: number;
}

export function useTextMetrics(options: UseTextMetricsOptions = {}) {
  const {
    fontSize = 12,
    fontStyle = 'normal',
    fontWeight = 'normal',
    debugCanvasWidth,
  } = options;
  const size = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
  const font = `${fontStyle} ${fontWeight} ${size} Arial`;

  const { context, getTextWidth, getTextHeight } = useMemo(() => {
    // Configure a new context rather than mutate one used by a previous render.
    const canvas = document.createElement('canvas');
    if (debugCanvasWidth) {
      canvas.width = debugCanvasWidth;
      canvas.height = 450;
    }
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create text metrics canvas');
    context.font = font;

    const metrics = context.measureText('M');
    const height =
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

    return {
      context,
      getTextWidth: (text: string) =>
        Math.round(context.measureText(text).width),
      getTextHeight: () => height,
    };
  }, [debugCanvasWidth, font]);

  useEffect(() => {
    if (!debugCanvasWidth) return;

    const { canvas } = context;
    Object.assign(canvas.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      zIndex: '100',
      opacity: '50%',
      background: 'white',
    });
    document.body.append(canvas);
    return () => canvas.remove();
  }, [context, debugCanvasWidth]);

  return {
    getTextWidth,
    getTextHeight,
    /**
     * @deprecated Use only for debug mode
     */
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    ctx: context,
  };
}
