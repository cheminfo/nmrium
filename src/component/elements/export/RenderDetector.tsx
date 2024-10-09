import { CSSProperties, ReactNode, useEffect } from 'react';

interface RenderDetectorProps {
  onRender: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export function RenderDetector(props: RenderDetectorProps) {
  const { onRender, style, children } = props;

  useEffect(() => {
    const handleRenderComplete = () => {
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
