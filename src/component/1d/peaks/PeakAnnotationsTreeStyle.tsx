import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { formatNumber } from '../../utility/formatNumber';
import { resolve } from '../utilities/intersectionResolver';

const emptyData = { peaks: {}, info: {}, display: {} };
const notationWidth = 10;
const notationMargin = 2;

function getDecimalsCount(max: number, format: string) {
  const numberOfDigits = format.replace(/\./, '').length;
  const fractionDigits = format.split('.')[1].length;

  return (
    Math.max(String(max.toFixed(0)).length, numberOfDigits - fractionDigits) +
    fractionDigits
  );
}

function PeakAnnotationsTreeStyle() {
  const { displayerKey, xDomain } = useChartData();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const { deltaPPM } = usePanelPreferences('peaks', spectrum.info.nucleus);

  const decimalsCount = getDecimalsCount(xDomain[1], deltaPPM.format);
  const mapPeaks = spectrum.peaks.values
    .map((peak) => ({
      ...peak,
      scaleX: scaleX()(peak.x),
    }))
    .sort((p1, p2) => p2.x - p1.x);

  if (!mapPeaks?.length) return null;

  const peaks = resolve(mapPeaks, {
    key: 'scaleX',
    width: notationWidth,
    margin: notationMargin,
    groupMargin: 10,
  });

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <g transform={`translate(0,${decimalsCount * 10})`}>
        {peaks.map((group) => {
          return (
            <g
              key={group.meta.id}
              transform={`translate(${group.meta.groupStartX},0)`}
            >
              {/* <rect
              x={group.meta.groupStartX - (notationWidth + notationMargin) / 2}
              y="0"
              width={group.meta.groupWidth}
              height="20"
              fill="red"
            /> */}
              {group.group.map((item, index) => {
                const gStartX = index * (notationWidth + notationMargin);

                return (
                  <>
                    <rect
                      x={gStartX - notationWidth / 2}
                      y={-decimalsCount * 10}
                      width={notationWidth}
                      height={decimalsCount * 10}
                      fill="white"
                    />
                    <text
                      transform={`rotate(-90) translate(0 ${gStartX})`}
                      dominantBaseline="middle"
                      textAnchor="start"
                      fontSize="11px"
                      fill="black"
                    >
                      {formatNumber(item.x, deltaPPM.format)}
                    </text>
                    <path
                      d={`M ${gStartX} 5 v 5 L ${
                        item.scaleX - group.meta.groupStartX
                      } 20 v 5`}
                      stroke={spectrum.display.color}
                      fill="transparent"
                    />
                  </>
                );
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
}

export default PeakAnnotationsTreeStyle;
