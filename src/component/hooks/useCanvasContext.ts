import { useRef } from 'react';

export function useCanvasContext(labelSize = 12) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  if (!contextRef.current) {
    const canvas = document.createElement('canvas');
    contextRef.current = canvas.getContext('2d');
    if (contextRef.current) {
      contextRef.current.font = `${labelSize}px Arial`;
    }
  }

  return contextRef.current;
}
