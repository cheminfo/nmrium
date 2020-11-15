import lodash from 'lodash';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import { Accordion, AccordionItem } from '../elements/accordion';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { options } from '../toolbar/ToolTypes';

import InformationPanel from './InformationPanel';
import IntegralPanel from './IntegralsPanel/IntegralPanel';
import MoleculePanel from './MoleculePanel';
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
    mode: null,
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

const Panels = memo(({ selectedTool, displayerMode }) => {
  // const { selectedTool } = useChartData();
  const [panelIndex, setSelectedPanelIndex] = useState(0);
  const preferences = usePreferences();

  const getDefaultIndex = useCallback(() => {
    const index = accordionItems.findIndex(
      (item) => item.openWhen && item.openWhen.includes(selectedTool),
    );
    return index === -1 ? panelIndex : index;
  }, [panelIndex, selectedTool]);

  useEffect(() => {
    if (selectedTool) {
      setSelectedPanelIndex(getDefaultIndex());
    }
  }, [getDefaultIndex, selectedTool]);

  const check = useCallback(
    (item) => {
      return (
        !lodash.get(preferences, `display.panels.${item.hidePreferenceKey}`) &&
        (item.mode == null || item.mode === displayerMode)
      );
    },
    [displayerMode, preferences],
  );

  return (
    // <div style={{ overflow: 'auto' }}>

    <Accordion defaultOpenIndex={panelIndex}>
      {accordionItems.map((item) => {
        return (
          check(item) && (
            <AccordionItem
              key={item.title}
              title={item.title}
              style={item.style}
            >
              {item.component}
            </AccordionItem>
          )
        );
      })}
    </Accordion>
  );
  // </div>
});

export default Panels;
