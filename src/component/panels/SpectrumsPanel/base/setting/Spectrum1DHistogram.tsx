import { xNoiseSanPlot } from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, LineSeries, Legend, Heading, Plot } from 'react-plot';

function prepareData(input) {
  const length = input.length;
  const jump = Math.floor(length / 307200) || 1;
  const array = new Float64Array((length / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = input[i];
  }
  return array;
}

function getLine(value, data, options) {
  const { log10, abs } = Math;
  const { yLogBase } = options;
  const first = data.length > 0 ? data[0].x : 0;
  const last = data.length > 0 ? data[data.length - 1].x : 0;
  const inLogScale = log10(abs(value)) / log10(yLogBase);
  return [
    { x: first, y: inLogScale },
    { x: last, y: inLogScale },
  ];
}

interface Spectrum1DHistogramProps {
  color?: string;
  data: any;
  options?: any;
}

function Spectrum1DHistogram({
  color = 'red',
  data,
  options = {},
}: Spectrum1DHistogramProps) {
  //factorStd = 5,
  const { yLogBase = 2 } = options;
  const processedData = useMemo(() => {
    const input = prepareData(data.re);

    const sanResult = xNoiseSanPlot(input, options);
    const sanPlot: any = {};
    const lines: any = {};
    for (let plotKey in sanResult.sanplot) {
      const { x, y } = sanResult.sanplot[plotKey];
      let result = new Array(x.length);
      for (let i = 0; i < x.length; i++) {
        result[i] = { x: x[i], y: y[i] };
      }
      sanPlot[plotKey] = result;
      lines[plotKey] = getLine(sanResult[plotKey], result, { yLogBase });
    }
    return { sanPlot, lines };
  }, [data.re, options, yLogBase]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'block' }}>
        <Plot width={180} height={220}>
          <Heading title="Sanplot" />
          <LineSeries
            data={processedData.sanPlot.positive}
            xAxis="x"
            yAxis="y"
            label="positive"
            lineStyle={{
              stroke: color,
              strokeWidth: 1.2,
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />
          <LineSeries
            data={processedData.lines.positive}
            xAxis="x"
            yAxis="y"
            label="noise level"
            lineStyle={{
              stroke: 'blue',
              strokeWidth: 0.8,
              strokeDasharray: '3, 3',
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />
          <Axis
            id="x"
            label="Pt"
            position="bottom"
            tickLabelStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.6rem' }}
          />
          <Axis
            id="y"
            label={`Intensity [Log${yLogBase}]`}
            position="left"
            tickLabelStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.7rem' }}
          />
          <Legend position="embedded" bottom={5} right={60} />
        </Plot>
      </div>
      <div style={{ display: 'block', width: 180, height: 180 }}>
        <Plot width={180} height={180}>
          <LineSeries
            data={processedData.sanPlot.negative}
            xAxis="x"
            yAxis="y"
            label="negative"
            lineStyle={{
              stroke: color,
              strokeWidth: 1.2,
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />

          <LineSeries
            data={processedData.lines.negative}
            xAxis="x"
            yAxis="y"
            label="noise level"
            lineStyle={{
              stroke: 'blue',
              strokeWidth: 0.8,
              strokeDasharray: '3, 3',
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />

          <Axis
            id="x"
            label="Pt"
            position="bottom"
            tickLabelStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.5rem' }}
          />
          <Axis
            id="y"
            label={`Intensity [Log${yLogBase}]`}
            position="left"
            tickLabelStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.7rem' }}
          />
          <Legend position="embedded" bottom={5} right={60} />
        </Plot>
      </div>
    </div>
  );
}

export default memo(Spectrum1DHistogram);
