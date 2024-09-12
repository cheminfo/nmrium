import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { useMemo, useRef, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { FaFileExport } from 'react-icons/fa';
import { Axis, LineSeries, Plot } from 'react-plot';
import { Button } from 'react-science/ui';

import { SpectraAnalysisData } from '../../../data/data1d/multipleSpectraAnalysis';
import { useChartData } from '../../context/ChartContext';
import { useToaster } from '../../context/ToasterContext';
import { Input2 } from '../../elements/Input2';
import Label from '../../elements/Label';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import { copyPNGToClipboard } from '../../utility/export';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths';

interface PlotAxisOptions {
  xPath: string;
  yPath: string;
}

interface PlotChartPros {
  spectraAnalysisData: SpectraAnalysisData;
}

const padding = 15;
const svgId = 'multiple-analysis-svg';

function prepareAnalysisData(
  analysisData: SpectraAnalysisData,
  columnKey: string,
) {
  const valueKey = analysisData.options.columns?.[columnKey]?.valueKey;
  const spectraAnalysis: Record<string, number> = {};
  if (valueKey) {
    for (const record of analysisData.values) {
      const data = record?.[columnKey];
      spectraAnalysis[data.SID] = data[valueKey];
    }
  }
  return spectraAnalysis;
}

function usePlotData(
  analysisData: SpectraAnalysisData,
  options: PlotAxisOptions & { paths: Record<string, string[]> },
) {
  const spectra = useSpectraByActiveNucleus();

  const { yPath, xPath, paths } = options;
  const xPathKeys = paths?.[xPath];
  const yPathKeys = paths?.[yPath];

  let xData;
  let yData;

  const analysisColumns = getAnalysisColumns(analysisData);

  if (analysisColumns.includes(xPath)) {
    xData = prepareAnalysisData(analysisData, xPath);
  }
  if (analysisColumns.includes(yPath)) {
    yData = prepareAnalysisData(analysisData, yPath);
  }

  return spectra.map((spectrum, index) => {
    const x = xData
      ? xData[spectrum.id]
      : lodashGet(spectrum, xPathKeys, index);
    const y = yData
      ? yData[spectrum.id]
      : lodashGet(spectrum, yPathKeys, index);
    return {
      x,
      y,
    };
  });
}

function getAnalysisColumns(spectraAnalysisData: SpectraAnalysisData) {
  return Object.keys(spectraAnalysisData.options.columns);
}

function getAnalysisColumnsPaths(spectraAnalysisData: SpectraAnalysisData) {
  const datalist = getAnalysisColumns(spectraAnalysisData);
  const paths: Record<string, string[]> = {};
  for (const key of datalist) {
    paths[key] = [key];
  }
  return {
    datalist,
    paths,
  };
}

export default function AnalysisChart(props: PlotChartPros) {
  const { spectraAnalysisData } = props;
  const { data } = useChartData();
  const toaster = useToaster();
  const chartParentRef = useRef<HTMLDivElement>(null);
  const [plotOptions, setPlotOptions] = useState<PlotAxisOptions>({
    xPath: '',
    yPath: '',
  });

  const { datalist, paths } = useMemo(() => {
    const { datalist: xDataList, paths: xPaths } = getSpectraObjectPaths(data, [
      'info',
      'meta',
      'customInfo',
    ]);
    const { datalist: yDataList, paths: yPaths } =
      getAnalysisColumnsPaths(spectraAnalysisData);
    const datalist = yDataList.concat(xDataList);
    const paths = { ...yPaths, ...xPaths };
    return { datalist, paths };
  }, [data, spectraAnalysisData]);

  function handleChangeKey(
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!event) return;
    const { name } = event.target;
    setPlotOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  }

  function handleCopy() {
    if (chartParentRef.current) {
      void copyPNGToClipboard(svgId, {
        rootElement: chartParentRef.current,
        css: css({ text: { fill: 'black' } }),
      });
      toaster.show({ message: 'Chart copied to clipboard', intent: 'success' });
    }
  }

  const plotData = usePlotData(spectraAnalysisData, { ...plotOptions, paths });
  const xLabel = paths?.[plotOptions.xPath]?.at(-1) || '';
  const yLabel = paths?.[plotOptions.yPath]?.at(-1) || '';

  return (
    <div>
      <div style={{ display: 'flex', padding: '5px' }}>
        <Label title="X">
          <Input2
            name="xPath"
            value={plotOptions.xPath}
            filterItems={datalist}
            onChange={handleChangeKey}
          />
        </Label>
        <Label title="Y" style={{ container: { paddingLeft: '5px' } }}>
          <Input2
            name="yPath"
            value={plotOptions.yPath}
            filterItems={datalist}
            onChange={handleChangeKey}
          />
        </Label>
        <Button
          intent="success"
          icon={<FaFileExport />}
          minimal
          onClick={handleCopy}
          tooltipProps={{ content: 'Copy chart to clipboard' }}
        />
      </div>
      <div
        style={{
          width: '100%',
          position: 'relative',
          height: '220px',
        }}
        ref={chartParentRef}
      >
        <ResponsiveChart>
          {({ width, height }) => (
            <Plot
              width={width}
              height={height}
              svgClassName={svgId}
              svgId={svgId}
              margin={{
                top: padding,
                right: padding,
                left: padding,
                bottom: padding,
              }}
            >
              <LineSeries data={plotData} xAxis="x" yAxis="y" />
              <Axis
                id="x"
                label={`X ( ${xLabel} )`}
                position="bottom"
                tickLabelStyle={{ fontSize: '0.6rem' }}
                labelStyle={{ fontSize: '0.6rem' }}
              />
              <Axis
                id="y"
                label={`Y ( ${yLabel} )`}
                position="left"
                tickLabelStyle={{ fontSize: '0.6rem' }}
                labelStyle={{ fontSize: '0.7rem' }}
              />
            </Plot>
          )}
        </ResponsiveChart>
      </div>
    </div>
  );
}
