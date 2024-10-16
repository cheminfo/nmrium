/** @jsxImportSource @emotion/react */

import { SvgNmrExportAsMatrix } from 'cheminfo-font';
import { IoAnalytics } from 'react-icons/io5';
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { TooltipHelpContent } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { useToggleSpectraVisibility } from '../../hooks/useToggleSpectraVisibility.js';
import { booleanToString } from '../../utility/booleanToString.js';
import { exportAsMatrix } from '../../utility/export.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';

import { useHasSignalProcessingFilter } from './MatrixGenerationPanel.js';

interface MatrixGenerationPanelHeaderProps {
  showStocsy: boolean;
  showBoxPlot: boolean;
}

export function MatrixGenerationPanelHeader(
  props: MatrixGenerationPanelHeaderProps,
) {
  const { showStocsy, showBoxPlot } = props;

  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const { dispatch: dispatchPreferences } = usePreferences();
  const spectraPreferences = usePanelPreferences('spectra', activeTab);
  const { getToggleVisibilityButtons } = useToggleSpectraVisibility({
    enableHideSelected: false,
    enableShowSelected: false,
    enableShowSelectedOnly: false,
  });

  const signalProcessingFilterData = useHasSignalProcessingFilter();

  function handleExportAsMatrix() {
    exportAsMatrix(data, spectraPreferences?.columns || [], 'Spectra Matrix');
  }
  function handleToggleStocsy() {
    dispatchPreferences({
      type: 'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
      payload: { key: 'showStocsy', nucleus: activeTab },
    });
  }
  function handleToggleBoxplot() {
    dispatchPreferences({
      type: 'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
      payload: { key: 'showBoxPlot', nucleus: activeTab },
    });
  }

  return (
    <DefaultPanelHeader
      leftButtons={[
        {
          disabled: !signalProcessingFilterData,
          icon: <SvgNmrExportAsMatrix />,
          tooltip: <ExportAsMatrixTooltip />,
          onClick: handleExportAsMatrix,
        },
        ...getToggleVisibilityButtons(),
        {
          disabled: !signalProcessingFilterData,
          icon: <IoAnalytics />,
          tooltip: <StocsyTooltip showStocsy={showStocsy} />,
          onClick: handleToggleStocsy,
          active: showStocsy,
        },
        {
          disabled: !signalProcessingFilterData,
          icon: <TbBrandGoogleAnalytics />,
          tooltip: <BoxPlotTooltip showBoxPlot={showBoxPlot} />,
          onClick: handleToggleBoxplot,
          active: showBoxPlot,
        },
      ]}
    />
  );
}

function ExportAsMatrixTooltip() {
  return (
    <TooltipHelpContent
      title="Export spectra as a matrix"
      description="Export the matrix as a tab-delimited file. The first row contains meta information labels followed by the chemical shifts. Next rows contains the meta information and the intensities of the spectra."
    />
  );
}
function StocsyTooltip({ showStocsy }) {
  return (
    <TooltipHelpContent
      title={`${booleanToString(!showStocsy)} STOCSY`}
      subTitles={[
        { title: 'Vertical zoom', shortcuts: ['⌥', 'Scroll wheel'] },
        { title: 'STOCSY pivot', shortcuts: ['⇧', 'click'] },
      ]}
      description="Statistical Total Correlation Spectroscopy (STOCSY) is a method to identify correlations between signals."
      link="https://doi.org/10.1021/ac048630x"
    />
  );
}

function BoxPlotTooltip({ showBoxPlot }) {
  return (
    <TooltipHelpContent
      title={`${booleanToString(!showBoxPlot)} box plot`}
      subTitles={[{ title: 'Vertical zoom', shortcuts: ['⌥', 'Scroll wheel'] }]}
      description="Display box plot like information. Light grey for min/max, dark grey for 1st/3rd quartile, and black for median."
    />
  );
}
