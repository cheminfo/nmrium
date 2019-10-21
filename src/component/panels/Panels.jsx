import React from 'react';

import { Accordion, AccordionItem } from '../elements/accordion';

import SpectrumListPanel from './SpectrumListPanel';
import IntegralTablePanel from './IntegralTablePanel';
import MoleculePanel from './MoleculePanel';
import { useChartData } from '../context/ChartContext';

const Panels = () => {
  const { height } = useChartData();
  return (
    <Accordion height={height}>
      <AccordionItem title="Spectra">
        <SpectrumListPanel />
      </AccordionItem>
      <AccordionItem title="information">
        <p>information</p>
      </AccordionItem>
      <AccordionItem title="Peaks">
        <p>peaks</p>
      </AccordionItem>
      <AccordionItem title="Integrals">
        <IntegralTablePanel />
      </AccordionItem>
      <AccordionItem title="Structures">
        <MoleculePanel />
      </AccordionItem>
    </Accordion>
  );
};

export default Panels;
