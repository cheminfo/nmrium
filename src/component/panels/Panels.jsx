import React from 'react';

import { Accordion, AccordionItem } from '../elements/accordion';

import SpectrumListPanel from './SpectrumListPanel';
import IntegralTablePanel from './IntegralTablePanel';
import MoleculePanel from './MoleculePanel';
import FilterPanel from './FilterPanel';

const Panels = () => {
  return (
    <Accordion>
      <AccordionItem title="Spectra">
        <SpectrumListPanel />
      </AccordionItem>
      <AccordionItem title="information">
        <p>information</p>
      </AccordionItem>
      <AccordionItem title="Peaks">
        <p>peaks</p>
      </AccordionItem>
      <AccordionItem title="Filter">
        <FilterPanel />
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
