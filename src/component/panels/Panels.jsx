import React, { useCallback, useState, useEffect, memo } from 'react';
import lodash from 'lodash';

import { Accordion, AccordionItem } from '../elements/accordion';
import { options } from '../toolbar/ToolTypes';
import { useChartData } from '../context/ChartContext';
import ConnectToContext from '../hoc/ConnectToContext';

import SpectrumListPanel from './SpectrumListPanel';
import IntegralTablePanel from './IntegralTablePanel';
import MoleculePanel from './MoleculePanel';
import FilterPanel from './FilterPanel';
import InformationPanel from './InformationPanel';
import RangesTablePanel from './RangesTablePanel';
import PeaksTablePanel from './PeaksTablePanel';

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
    component: <RangesTablePanel />,
    openWhen: [options.autoRangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideRangesPanel',
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    openWhen: [options.autoRangesPicking.id],
    style: '',
    hidePreferenceKey: 'hideStructuresPanel',
  },
];

const Panels = memo(({ preferences, selectedTool }) => {
  // const { selectedTool } = useChartData();
  const [panelIndex, setSelectedPanelIndex] = useState(0);

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
