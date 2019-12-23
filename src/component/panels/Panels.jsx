import React, { useCallback, useState, useEffect } from 'react';

import { Accordion, AccordionItem } from '../elements/accordion';
import { options } from '../toolbar/ToolTypes';
import { useChartData } from '../context/ChartContext';

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
    when: null,
    style: '',
  },
  {
    title: 'Information',
    component: <InformationPanel />,
    when: null,
    style: { overflow: 'hidden' },
  },
  {
    title: 'Peaks',
    component: <PeaksTablePanel />,
    when: [options.peakPicking.id],
    style: '',
  },
  {
    title: 'Filters',
    component: <FilterPanel />,
    when: null,
    style: '',
  },
  {
    title: 'Integrals',
    component: <IntegralTablePanel />,
    when: [options.integral.id],
    style: '',
  },
  {
    title: 'Ranges',
    component: <RangesTablePanel />,
    when: [options.autoRangesPicking.id],
    style: '',
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    when: [options.autoRangesPicking.id],
    style: '',
  },
];

const Panels = () => {
  const { selectedTool } = useChartData();
  const [panelIndex, setSelectedPanelIndex] = useState(0);

  const getDefaultIndex = useCallback(() => {
    const index = accordionItems.findIndex(
      (item) => item.when && item.when.includes(selectedTool),
    );
    return index === -1 ? 0 : index;
  }, [selectedTool]);

  useEffect(() => {
    if (selectedTool) {
      setSelectedPanelIndex(getDefaultIndex());
    }
  }, [getDefaultIndex, selectedTool]);

  return (
    <Accordion defaultOpenIndex={panelIndex}>
      {accordionItems.map((item) => {
        return (
          <AccordionItem key={item.title} title={item.title} style={item.style}>
            {item.component}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default Panels;
