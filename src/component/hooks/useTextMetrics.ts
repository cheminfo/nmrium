import { useRef } from 'react';

function measureTextWidth(
  context: CanvasRenderingContext2D | null,
  text: string,
) {
  if (!context) return 0;
  return Math.round(context.measureText(text).width);
}

interface UseTextMetricsOptions {
  labelSize?: number;
  labelStyle?: string;
  labelWeight?: string;
}

export function useTextMetrics(options: UseTextMetricsOptions = {}) {
  const {
    labelSize = 12,
    labelStyle = 'normal',
    labelWeight = 'normal',
  } = options;
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  if (!contextRef.current) {
    const canvas = document.createElement('canvas');
    contextRef.current = canvas.getContext('2d');
    if (contextRef.current) {
      contextRef.current.font = `${labelStyle} ${labelWeight} ${labelSize}px Arial`;
    }
  }

  function getTextWidth(text: string): number {
    return measureTextWidth(contextRef.current, text);
  }

  return { getTextWidth };
}
