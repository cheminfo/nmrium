import { HighlightEventSource, useHighlight } from '../../highlight';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { formatNumber } from '../../utility/formatNumber';
import { PeakEditionListener } from './PeakEditionManager';
import { useScaleChecked } from '../../context/ScaleContext';
import { Peak1D } from 'nmr-processing';

interface PeakAnnotationProps {
  peak: Peak1D;
  spectrumId: string;
  color: string;
  nucleus: string;
}

function PeakAnnotation({
  peak,
  spectrumId,
  color,
  nucleus,
}: PeakAnnotationProps) {
  const { id, x, y } = peak;
  const sign = Math.sign(y);

  const { deltaPPM } = usePanelPreferences('peaks', nucleus);
  const highlight = useHighlight([id], {
    type: HighlightEventSource.PEAK,
    extra: { id },
  });
  const { scaleX, scaleY } = useScaleChecked();

  function handleOnEnterNotation() {
    highlight.show();
  }

  function handleOnMouseLeaveNotation() {
    highlight.hide();
  }

  const sx = scaleX()(x);
  const sy = scaleY(spectrumId)(y) - 5;

  return (
    <g
      style={{ outline: 'none' }}
      transform={`translate(${sx}, ${sy})`}
      onMouseEnter={handleOnEnterNotation}
      onMouseLeave={handleOnMouseLeaveNotation}
    >
      <line
        x1="0"
        x2="0"
        y1={sign === -1 ? 10 : 0}
        y2={sign === -1 ? 28 : -18}
        stroke={color}
        strokeWidth={highlight.isActive ? '7px' : '1px'}
      />
      <PeakEditionListener
        value={x}
        x={x}
        y={y}
        useScaleX
        useScaleY
        id={id}
        dy={sign === -1 ? 0 : -26}
      >
        <text
          x="0"
          y={sign === -1 ? 26 : -10}
          dy="0"
          dx="0.35em"
          fontSize="11px"
          fill={color}
        >
          {formatNumber(x, deltaPPM.format)}
        </text>
      </PeakEditionListener>
    </g>
  );
}

export default PeakAnnotation;
