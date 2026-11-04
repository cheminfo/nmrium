import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface RenderDetectorProps {
  onRender: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export function RenderDetector(props: RenderDetectorProps) {
  const { onRender, style, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    let animationFrameId = 0;

    void element.ownerDocument.fonts.ready.then(() => {
      if (!active) return;
      animationFrameId = requestAnimationFrame(() => {
        onRender();
      });
    });

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [onRender]);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
