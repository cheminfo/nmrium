import lodash from 'lodash';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import { Accordion, AccordionItem } from '../elements/accordion';
import { options } from '../toolbar/ToolTypes';

import InformationPanel from './InformationPanel';
import IntegralPanel from './IntegralsPanel/IntegralPanel';
import MoleculePanel from './MoleculePanel';
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
  },
  {
    title: 'Information',
    component: <InformationPanel />,
    openWhen: null,
    style: { overflow: 'hidden' },
    hidePreferenceKey: 'hideInformationPanel',
  },
  {
    title: 'Peaks',
    component: <PeaksPanel />,
    openWhen: [options.peakPicking.id],
    style: '',
    hidePreferenceKey: 'hidePeaksPanel',
  },
  {
    title: 'Filters',
    component: <FilterPanel />,
    openWhen: null,
    style: '',
    hidePreferenceKey: 'hideFiltersPanel',
  },
  {
    title: 'Integrals',
    component: <IntegralPanel />,
    openWhen: [options.integral.id],
    style: '',
    hidePreferenceKey: 'hideIntegralsPanel',
  },
  {
    title: 'Ranges',
    component: <RangesPanel />,
    openWhen: [options.rangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideRangesPanel',
  },
  {
    title: 'Zones',
    component: <ZonesPanel />,
    openWhen: [options.zone2D.id],
    style: '',
    hidePreferenceKey: 'hideZonesPanel',
  },
  {
    title: 'Summary',
    component: <SummaryPanel />,
    openWhen: [],
    style: '',
    hidePreferenceKey: 'hideSummaryPanel',
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    openWhen: [options.rangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideStructuresPanel',
  },
];

const Panels = memo(({ selectedTool }) => {
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

  return (
    <Accordion defaultOpenIndex={panelIndex}>
      {accordionItems.map((item) => {
        return !lodash.get(preferences, `panels.${item.hidePreferenceKey}`) ? (
          <AccordionItem key={item.title} title={item.title} style={item.style}>
            {item.component}
          </AccordionItem>
        ) : (
          <span />
        );
      })}
    </Accordion>
  );
});

export default Panels;
