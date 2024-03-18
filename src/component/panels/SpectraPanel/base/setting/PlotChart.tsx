import {
  Axis,
  Heading,
  Legend,
  LineSeries,
  Plot,
  SeriesPoint,
} from 'react-plot';

interface PlotData {
  positive: SeriesPoint[];
  negative: SeriesPoint[];
}
interface PlotChartPros {
  data: { sanPlot: PlotData; lines: PlotData };
  sign: 'positive' | 'negative';
  color: string;
  yLogBase: number;
  hideHeading?: boolean;
}

export default function PlotChart({
  data,
  sign,
  color,
  yLogBase,
  hideHeading = false,
}: PlotChartPros) {
  return (
    <Plot width={180} height={220}>
      {!hideHeading && <Heading title="Sanplot" />}
      <LineSeries
        data={data.sanPlot?.[sign] || []}
        xAxis="x"
        yAxis="y"
        label={sign}
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
        data={data.lines?.[sign] || []}
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
  );
}
