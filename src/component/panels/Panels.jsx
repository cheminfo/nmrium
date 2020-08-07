import lodash from 'lodash';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { Accordion, AccordionItem } from '../elements/accordion';
import ConnectToContext from '../hoc/ConnectToContext';
import { options } from '../toolbar/ToolTypes';

import FilterPanel from './FilterPanel';
import InformationPanel from './InformationPanel';
import IntegralTablePanel from './IntegralsPanel/IntegralTablePanel';
import MoleculePanel from './MoleculePanel';
import PeaksTablePanel from './PeaksPanel/PeaksTablePanel';
import RangesPanel from './RangesPanel/RangesPanel';
import SpectrumListPanel from './SpectrumsPanel/SpectrumListPanel';
import ZonesPanel from './ZonesPanel/ZonesPanel';

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
    component: <PeaksTablePanel />,
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
    component: <IntegralTablePanel />,
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
    hidePreferenceKey: '',
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

export default ConnectToContext(Panels, useChartData);
