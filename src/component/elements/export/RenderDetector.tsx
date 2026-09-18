import type { CSSProperties, ReactNode } from 'react';
import { useEffect } from 'react';

interface RenderDetectorProps {
  onRender: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export function RenderDetector(props: RenderDetectorProps) {
  const { onRender, style, children } = props;

  useEffect(() => {
    const handleRenderComplete = () => {
      // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout
      setTimeout(() => {
        onRender();
      }, 250);
    };

    const animationFrameId = requestAnimationFrame(handleRenderComplete);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onRender]);

  return <div style={style}>{children}</div>;
}
