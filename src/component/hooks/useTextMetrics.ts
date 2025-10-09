import { useRef } from 'react';

function measureTextWidth(
  context: CanvasRenderingContext2D | null,
  text: string,
) {
  if (!context) return 0;
  return Math.round(context.measureText(text).width);
}

export function useTextMetrics(labelSize = 12) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  if (!contextRef.current) {
    const canvas = document.createElement('canvas');
    contextRef.current = canvas.getContext('2d');
    if (contextRef.current) {
      contextRef.current.font = `${labelSize}px Arial`;
    }
  }

  function getTextWidth(text: string): number {
    return measureTextWidth(contextRef.current, text);
  }

  return { getTextWidth };
}
