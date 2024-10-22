import type { ButtonProps } from '@blueprintjs/core';
import { css } from '@emotion/react';
import lodashGet from 'lodash/get.js';
import type {
  JpathTableColumn,
  Spectrum,
  WorkSpacePanelPreferences,
} from 'nmr-load-save';
import { useMemo, useRef, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { FaCopy, FaFileExport, FaFileImage } from 'react-icons/fa';
import { Axis, LineSeries, Plot } from 'react-plot';
import { Button, Toolbar } from 'react-science/ui';

import type { SpectraAnalysisData } from '../../../data/data1d/multipleSpectraAnalysis.js';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useChartData } from '../../context/ChartContext.js';
import { useSortSpectra } from '../../context/SortSpectraContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { Input2 } from '../../elements/Input2.js';
import Label from '../../elements/Label.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { copyPNGToClipboard } from '../../utility/export.js';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths.js';

const MOL_EXPORT_MENU: ToolbarPopoverMenuItem[] = [
  {
    icon: <FaCopy />,
    text: 'Copy chart to clipboard',
    data: {
      id: 'copyChart',
    },
  },
  {
    icon: <FaFileImage />,
    text: 'Copy tab-delimited to clipboard',
    data: {
      id: 'copyData',
    },
  },
];

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

type PlotOptions = PlotAxisOptions & { paths: Record<string, string[]> };

export function getPlotDataAsString(
  spectraAnalysis: SpectraAnalysisData,
  options: {
    plotOptions: PlotOptions;
    spectra: Spectrum[];
    spectraPanelPreferences: WorkSpacePanelPreferences['spectra'];
  },
) {
  const { plotOptions, spectra, spectraPanelPreferences } = options;
  const { xPath, yPath } = plotOptions;

  if (spectraAnalysis) {
    const { xData, yData, xPathKeys, yPathKeys } = preparePlotData(
      spectraAnalysis,
      plotOptions,
    );

    const columnsLabels: string[] = [xPath || 'serial', yPath || 'serial'];
    let headerIndex = 0;
    // listed the spectra panel columns
    for (const col of spectraPanelPreferences.columns) {
      if (col.visible && 'jpath' in col) {
        columnsLabels.splice(headerIndex, 0, col.label);
        headerIndex++;
      }
    }

    let result = `${columnsLabels.join('\t')}\n`;
    let index = 0;

    for (const spectrum of spectra) {
      const cellsValues: string[] = [];

      // listed the spectra cell values
      for (const col of spectraPanelPreferences.columns) {
        if (col.visible && 'jpath' in col) {
          const jpath = (col as JpathTableColumn)?.jpath;
          const value = lodashGet(spectrum, jpath, `null`);
          cellsValues.push(value);
        }
      }

      const x = xData
        ? xData[spectrum.id]
        : lodashGet(spectrum, xPathKeys, index);
      const y = yData
        ? yData[spectrum.id]
        : lodashGet(spectrum, yPathKeys, index);

      cellsValues.push(x, y);

      result += `${cellsValues.join('\t')}\n`;
      index++;
    }

    return result;
  }
  return null;
}

function preparePlotData(
  analysisData: SpectraAnalysisData,
  options: PlotOptions,
) {
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
  return { xPathKeys, yPathKeys, xData, yData };
}

function usePlotData(
  analysisData: SpectraAnalysisData,
  options: { plotOption: PlotOptions; spectra: Spectrum[] },
) {
  const { spectra, plotOption } = options;
  const { xData, yData, xPathKeys, yPathKeys } = preparePlotData(
    analysisData,
    plotOption,
  );
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
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const toaster = useToaster();
  const spectraPreferences = usePanelPreferences('spectra', activeTab);
  const { sort } = useSortSpectra();
  const spectra = useSpectraByActiveNucleus();

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

  function handleCopyChart() {
    if (chartParentRef.current) {
      void copyPNGToClipboard(svgId, {
        rootElement: chartParentRef.current,
        css: css({ text: { fill: 'black' } }),
      });
      toaster.show({ message: 'Chart copied to clipboard', intent: 'success' });
    }
  }

  const plotData = usePlotData(spectraAnalysisData, {
    plotOption: { ...plotOptions, paths },
    spectra,
  });
  const xLabel = paths?.[plotOptions.xPath]?.at(-1) || '';
  const yLabel = paths?.[plotOptions.yPath]?.at(-1) || '';

  const { rawWriteWithType, cleanShouldFallback, shouldFallback, text } =
    useClipboard();

  function handleCopyData() {
    const data = getPlotDataAsString(spectraAnalysisData, {
      plotOptions: { ...plotOptions, paths },
      spectra,
      spectraPanelPreferences: spectraPreferences,
    });
    if (!data) return;

    void rawWriteWithType(data).then(() =>
      toaster.show({ message: 'Data copied to clipboard', intent: 'success' }),
    );
  }

  function exportHandler(selected) {
    switch (selected?.id) {
      case 'copyChart': {
        handleCopyChart();
        break;
      }
      case 'copyData': {
        handleCopyData();
        break;
      }
      default:
        break;
    }
  }

  function handleSort(axis: 'x' | 'y') {
    const analysisData = preparePlotData(spectraAnalysisData, {
      ...plotOptions,
      paths,
    });
    let sortByReferences;
    let path;
    let activeSort;
    if (axis === 'x') {
      if (analysisData.xData) {
        path = 'value';
        sortByReferences = Object.keys(analysisData.xData).map(
          (spectrumKey) => ({
            id: spectrumKey,
            value: analysisData.xData[spectrumKey],
          }),
        );
      } else {
        path = plotOptions.xPath;
      }
      activeSort = plotOptions.xPath;
    }

    if (axis === 'y') {
      if (analysisData.yData) {
        path = 'value';
        sortByReferences = Object.keys(analysisData.yData).map(
          (spectrumKey) => ({
            id: spectrumKey,
            value: analysisData.yData[spectrumKey],
          }),
        );
      } else {
        path = plotOptions.yPath;
      }
      activeSort = plotOptions.yPath;
    }

    sort({
      sortType: sortByReferences ? 'sortByReference' : 'sortByPath',
      path,
      sortByReferences,
      activeSort,
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', padding: '5px' }}>
        <Label title="X">
          <Input2
            name="xPath"
            value={plotOptions.xPath}
            filterItems={datalist}
            onChange={handleChangeKey}
            rightElement={
              <SortButton
                value={plotOptions.xPath}
                onClick={() => handleSort('x')}
              />
            }
          />
        </Label>
        <Label title="Y" style={{ container: { paddingLeft: '5px' } }}>
          <Input2
            name="yPath"
            value={plotOptions.yPath}
            filterItems={datalist}
            onChange={handleChangeKey}
            rightElement={
              <SortButton
                value={plotOptions.yPath}
                onClick={() => handleSort('y')}
              />
            }
          />
        </Label>
        <Toolbar>
          <ToolbarPopoverItem
            options={MOL_EXPORT_MENU}
            onClick={exportHandler}
            tooltip="Export As"
            icon={<FaFileExport />}
          />
        </Toolbar>
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
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Spectra Analysis"
      />
    </div>
  );
}

interface SortButtonProps {
  value: string;
  onClick: ButtonProps['onClick'];
}

function SortButton(props: SortButtonProps) {
  const { value, onClick } = props;
  const { sortOptions, activeSort } = useSortSpectra();

  let icon: ButtonProps['icon'] = 'sort';

  if (
    activeSort === value &&
    sortOptions?.sortType !== 'sortByReferenceIndexes'
  ) {
    switch (sortOptions?.sortDirection) {
      case 'asc':
        icon = 'sort-asc';
        break;
      case 'desc':
        icon = 'sort-desc';
        break;
      default:
    }
  }
  return <Button disabled={!value} icon={icon} outlined onClick={onClick} />;
}
