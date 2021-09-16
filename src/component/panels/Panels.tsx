import { Accordion } from 'analysis-ui-components';
import lodashGet from 'lodash/get';
import { useCallback, useState, useEffect, memo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { options } from '../toolbar/ToolTypes';

import InformationPanel from './InformationPanel';
import IntegralPanel from './IntegralsPanel/IntegralPanel';
import MoleculePanel from './MoleculesPanel/MoleculePanel';
import MultipleSpectraAnalysisPanel from './MultipleSpectraAnalysisPanel/MultipleSpectraAnalysisPanel';
import PeaksPanel from './PeaksPanel/PeaksPanel';
import RangesPanel from './RangesPanel/RangesPanel';
import SpectrumListPanel from './SpectrumsPanel/SpectrumListPanel';
import SummaryPanel from './SummaryPanel/SummaryPanel';
import ZonesPanel from './ZonesPanel/ZonesPanel';
import FilterPanel from './filtersPanel/FilterPanel';

const accordionItems = [
  {
    title: 'Spectra',
    component: <SpectrumListPanel />,
    openWhen: null,
    style: '',
    hidePreferenceKey: 'hideSpectraPanel',
    mode: null,
  },
  {
    title: 'Information',
    component: <InformationPanel />,
    openWhen: null,
    style: { overflow: 'hidden' },
    hidePreferenceKey: 'hideInformationPanel',
    mode: null,
  },
  {
    title: 'Peaks',
    component: <PeaksPanel />,
    openWhen: [options.peakPicking.id],
    style: '',
    hidePreferenceKey: 'hidePeaksPanel',
    mode: null,
  },
  {
    title: 'Filters',
    component: <FilterPanel />,
    openWhen: null,
    style: '',
    hidePreferenceKey: 'hideFiltersPanel',
    mode: null,
  },
  {
    title: 'Integrals',
    component: <IntegralPanel />,
    openWhen: [options.integral.id],
    style: '',
    hidePreferenceKey: 'hideIntegralsPanel',
    mode: null,
  },
  {
    title: 'Ranges',
    component: <RangesPanel />,
    openWhen: [options.rangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideRangesPanel',
    mode: DISPLAYER_MODE.DM_1D,
  },
  {
    title: 'Multiple Spectra Analysis',
    component: <MultipleSpectraAnalysisPanel />,
    openWhen: [options.multipleSpectraAnalysis.id],
    style: '',
    hidePreferenceKey: 'hideMultipleSpectraAnalysisPanel',
    mode: null,
  },
  {
    title: 'Zones',
    component: <ZonesPanel />,
    openWhen: [options.zone2D.id],
    style: '',
    hidePreferenceKey: 'hideZonesPanel',
    mode: DISPLAYER_MODE.DM_2D,
  },
  {
    title: 'Summary',
    component: <SummaryPanel />,
    openWhen: [],
    style: '',
    hidePreferenceKey: 'hideSummaryPanel',
    mode: null,
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    openWhen: [options.rangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideStructuresPanel',
    mode: null,
  },
];

function PanelsInner({ selectedTool, displayerMode }) {
  const [panelIndex, setSelectedPanelIndex] = useState<number | null>(0);
  const preferences = usePreferences();

  useEffect(() => {
    function getDefaultIndex() {
      const index = accordionItems.findIndex((item) =>
        item.openWhen?.includes(selectedTool),
      );
      return index !== -1 ? index : null;
    }
    const index = getDefaultIndex();
    if (selectedTool) {
      setSelectedPanelIndex(index);
    }
  }, [selectedTool]);

  const check = useCallback(
    (item) => {
      return (
        !lodashGet(preferences, `display.panels.${item.hidePreferenceKey}`) &&
        (item.mode == null || item.mode === displayerMode)
      );
    },
    [displayerMode, preferences],
  );

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <Accordion>
        {accordionItems.map((item, index) => {
          let isOpen = false;
          if (index === 0 && panelIndex === null) {
            isOpen = true;
          } else {
            isOpen = index === panelIndex;
          }

          return (
            check(item) && (
              <Accordion.Item
                key={`${item.title}-${index}`}
                title={item.title}
                defaultOpened={isOpen}
              >
                {item.component}
              </Accordion.Item>
            )
          );
        })}
      </Accordion>
    </div>
  );
}

const MemoizedPanels = memo(PanelsInner);

export default function Panels() {
  const {
    displayerMode,
    toolOptions: { selectedTool },
  } = useChartData();

  return <MemoizedPanels {...{ displayerMode, selectedTool }} />;
}
